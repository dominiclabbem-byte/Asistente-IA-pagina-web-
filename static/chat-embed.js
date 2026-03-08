/**
 * BestFood Chile - Widget de chat embebible
 *
 * Uso: Agrega este snippet en el <body> de tu página web:
 *
 *   <script>
 *     window.BESTFOOD_API_URL = 'https://tu-servidor.com/api/chat';
 *   </script>
 *   <script src="https://tu-servidor.com/static/chat-embed.js"></script>
 */
(function () {
  'use strict';

  const API_URL = window.BESTFOOD_API_URL || '/api/chat';
  const WELCOME_MSG = '¡Hola! Bienvenido/a a BestFood Chile 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?';

  // ── Estilos ────────────────────────────────────────────────
  const CSS = `
    #bf-toggle{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#e8231a,#c0392b);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(232,35,26,.4);display:flex;align-items:center;justify-content:center;z-index:9998;transition:transform .2s,box-shadow .2s}
    #bf-toggle:hover{transform:scale(1.08)}
    #bf-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:#fff;color:#e8231a;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #e8231a}
    #bf-chat{position:fixed;bottom:96px;right:24px;width:370px;max-height:560px;border-radius:18px;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;z-index:9999;animation:bfSlide .25s ease}
    #bf-chat.open{display:flex}
    @keyframes bfSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .bf-header{background:linear-gradient(135deg,#e8231a,#c0392b);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
    .bf-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px}
    .bf-header-info h3{font-size:15px;font-weight:600}
    .bf-header-info p{font-size:12px;opacity:.85}
    .bf-online{display:inline-block;width:8px;height:8px;background:#4ade80;border-radius:50%;margin-right:4px}
    .bf-x{margin-left:auto;background:none;border:none;color:#fff;cursor:pointer;font-size:22px;opacity:.8;padding:4px}
    .bf-x:hover{opacity:1}
    #bf-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    #bf-msgs::-webkit-scrollbar{width:4px}
    #bf-msgs::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}
    .bf-m{max-width:82%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word}
    .bf-m.bot{background:#f1f5f9;color:#1e293b;align-self:flex-start;border-bottom-left-radius:4px}
    .bf-m.user{background:linear-gradient(135deg,#e8231a,#c0392b);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .bf-chips{padding:8px 12px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid #f1f5f9}
    .bf-chip{background:#fff;border:1px solid #e2e8f0;color:#e8231a;font-size:12px;padding:5px 11px;border-radius:20px;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap}
    .bf-chip:hover{background:#e8231a;color:#fff;border-color:#e8231a}
    .bf-typing{display:flex;align-items:center;gap:4px;padding:10px 14px;background:#f1f5f9;border-radius:16px;border-bottom-left-radius:4px;align-self:flex-start}
    .bf-typing span{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:bfBounce 1.2s infinite}
    .bf-typing span:nth-child(2){animation-delay:.2s}
    .bf-typing span:nth-child(3){animation-delay:.4s}
    @keyframes bfBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    #bf-ia{padding:12px 14px;border-top:1px solid #f1f5f9;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
    #bf-inp{flex:1;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;font-size:14px;resize:none;outline:none;max-height:100px;overflow-y:auto;transition:border-color .2s;font-family:inherit}
    #bf-inp:focus{border-color:#e8231a}
    #bf-snd{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#e8231a,#c0392b);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .2s}
    #bf-snd:disabled{opacity:.5;cursor:not-allowed}
    .bf-foot{text-align:center;font-size:10px;color:#cbd5e1;padding:6px;flex-shrink:0}
    @media(max-width:420px){#bf-chat{width:calc(100vw - 16px);right:8px;bottom:80px}#bf-toggle{right:12px;bottom:12px}}
  `;

  // ── HTML ───────────────────────────────────────────────────
  const HTML = `
    <button id="bf-toggle" title="Chatea con nosotros">
      <div id="bf-badge">1</div>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="bf-chat">
      <div class="bf-header">
        <div class="bf-avatar">🍖</div>
        <div class="bf-header-info"><h3>BestFood Asistente</h3><p><span class="bf-online"></span>En línea ahora</p></div>
        <button class="bf-x" id="bf-x">&times;</button>
      </div>
      <div id="bf-msgs"></div>
      <div class="bf-chips" id="bf-chips">
        <button class="bf-chip" data-msg="¿Qué productos venden?">¿Qué productos tienen?</button>
        <button class="bf-chip" data-msg="¿Hacen despacho a domicilio?">¿Despachan a domicilio?</button>
        <button class="bf-chip" data-msg="Quiero solicitar una cotización">Solicitar cotización</button>
        <button class="bf-chip" data-msg="¿Cuáles son sus precios?">Precios</button>
      </div>
      <div id="bf-ia">
        <textarea id="bf-inp" placeholder="Escribe tu pregunta..." rows="1"></textarea>
        <button id="bf-snd" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="bf-foot">Powered by BestFood Chile IA · Claude AI</div>
    </div>
  `;

  // ── Inyectar estilos y HTML ────────────────────────────────
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  document.body.appendChild(wrapper);

  // ── Lógica ─────────────────────────────────────────────────
  const toggle  = document.getElementById('bf-toggle');
  const chat    = document.getElementById('bf-chat');
  const closeX  = document.getElementById('bf-x');
  const msgs    = document.getElementById('bf-msgs');
  const inp     = document.getElementById('bf-inp');
  const snd     = document.getElementById('bf-snd');
  const badge   = document.getElementById('bf-badge');
  const chips   = document.getElementById('bf-chips');

  let history = [], open = false, busy = false, inited = false;

  toggle.onclick = () => {
    open = !open;
    chat.classList.toggle('open', open);
    badge.style.display = 'none';
    if (open && !inited) { inited = true; addMsg('bot', WELCOME_MSG); }
    if (open) inp.focus();
  };
  closeX.onclick = () => { open = false; chat.classList.remove('open'); };

  chips.querySelectorAll('.bf-chip').forEach(c => {
    c.onclick = () => { send(c.dataset.msg); chips.style.display = 'none'; };
  });

  inp.oninput = () => {
    snd.disabled = !inp.value.trim();
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
  };
  inp.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } };
  snd.onclick = go;

  function go() {
    const t = inp.value.trim();
    if (!t || busy) return;
    send(t);
    inp.value = ''; inp.style.height = 'auto'; snd.disabled = true;
  }

  function addMsg(role, text) {
    const d = document.createElement('div');
    d.className = 'bf-m ' + role;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'bf-typing'; d.id = 'bf-typ';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const d = document.getElementById('bf-typ');
    if (d) d.remove();
  }

  async function send(text) {
    if (busy) return;
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    busy = true; snd.disabled = true;
    showTyping();
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      hideTyping();
      addMsg('bot', d.reply);
      history.push({ role: 'assistant', content: d.reply });
    } catch {
      hideTyping();
      addMsg('bot', 'Tuve un problema al conectarme. Escríbenos a ventas@bestfoodchile.cl o llama al +56 9 XXXX XXXX.');
    } finally {
      busy = false;
      snd.disabled = !inp.value.trim();
    }
  }
})();
