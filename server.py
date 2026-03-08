import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="BestFood Chile - Asistente IA")

# CORS: permite peticiones desde la página web de BestFood Chile
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "https://bestfoodchile.cl,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """Eres el asistente virtual de BestFood Chile, una empresa chilena especializada en la distribución y venta de alimentos de alta calidad para hogares, restaurantes, hoteles y empresas del rubro gastronómico.

## Tu rol
Eres un asistente amable, profesional y orientado a convertir visitas en clientes (leads). Tu objetivo principal es:
1. Responder las dudas de los visitantes sobre productos y servicios
2. Identificar las necesidades del cliente potencial
3. Capturar información de contacto (nombre, teléfono, email) para que el equipo de ventas pueda hacer seguimiento
4. Motivar al visitante a dar el siguiente paso: solicitar una cotización o hablar con un ejecutivo

## Información de BestFood Chile
- **Empresa**: BestFood Chile - Distribución y venta de alimentos premium
- **Clientes objetivo**: Restaurantes, hoteles, casinos, empresas de catering, y familias que buscan calidad
- **Productos**: Carnes premium, mariscos frescos, vegetales y frutas seleccionadas, lácteos, productos importados, congelados de calidad
- **Servicios**:
  - Despacho a domicilio y a local comercial
  - Pedidos programados (semanal/mensual)
  - Asesoría en menú y selección de productos
  - Precios por volumen para empresas
- **Zona de cobertura**: Santiago y regiones (confirmar disponibilidad según ubicación)
- **Formas de pago**: Transferencia bancaria, tarjeta de crédito/débito, factura para empresas
- **Contacto**: ventas@bestfoodchile.cl | +56 9 XXXX XXXX
- **Horario de atención**: Lunes a Viernes 8:00 - 18:00, Sábado 9:00 - 13:00

## Cómo capturar leads
Cuando el visitante muestre interés en comprar o cotizar, pregunta amablemente:
- Nombre
- Teléfono o email de contacto
- Tipo de negocio (si aplica) o si es para hogar
- Productos de interés o volumen aproximado

Una vez que tengas estos datos, indica que un ejecutivo lo contactará pronto y muestra entusiasmo genuino.

## Tono y estilo
- Usa un tono cálido, cercano y profesional (tuteo o usted según el contexto)
- Respuestas concisas y directas, máximo 3-4 oraciones por mensaje
- Si no sabes algo específico (como precios exactos), ofrece conectar al visitante con el equipo de ventas
- Siempre en español chileno natural

## Importante
- No inventes precios ni garantías que no puedas confirmar
- Si te preguntan algo fuera de tu alcance, redirige amablemente hacia el equipo de ventas
- Nunca proporciones información falsa sobre la empresa"""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    lead_data: dict = {}


class ChatResponse(BaseModel):
    reply: str
    lead_captured: bool = False


@app.get("/")
async def root():
    return FileResponse("static/widget.html")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "BestFood Chile AI Assistant"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="API key no configurada")

    if len(request.messages) == 0:
        raise HTTPException(status_code=400, detail="No se recibieron mensajes")

    # Limitar historial a últimos 20 mensajes para controlar costos
    messages = request.messages[-20:]

    api_messages = [{"role": m.role, "content": m.content} for m in messages]

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=api_messages,
    )

    reply = response.content[0].text

    # Detectar si se capturó un lead (presencia de email o teléfono en la conversación)
    conversation_text = " ".join([m.content for m in messages])
    lead_captured = any(
        keyword in conversation_text.lower()
        for keyword in ["@", "+56", "teléfono", "telefono", "email", "contactar", "llamen"]
    )

    return ChatResponse(reply=reply, lead_captured=lead_captured)
