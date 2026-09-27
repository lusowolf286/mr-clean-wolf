/* Mr Clean Wolf — compatibilidade iOS (app nativa, Safari e PWA) e teclados de terceiros (SwiftKey, Gboard…).
   Usado pelas apps de gestão, de cliente e pelo formulário de dados.
   1. Atributos de teclado certos em cada campo (tipo de teclado, maiúsculas, correção automática, tecla Enter).
   2. Altura do teclado em --kb, para que nada fique escondido por baixo dele.
   3. O campo ativo fica sempre visível acima do teclado.
   4. Códigos de acesso colados ou sugeridos com espaços são limpos. */
(() => {
"use strict";
const root = document.documentElement;
const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
root.classList.toggle("native", native);

/* ---------- 1. atributos de teclado ---------- */
const SKIP = new Set(["checkbox","radio","file","date","time","datetime-local","month","hidden","range","color","submit","button","reset","image"]);
const NAME_RX = /(^|-)(nome|cli|via|vv|loja|gen|xn|desc)(-|$)/i;
function tune(el){
  if (el.dataset.kb === "1") return;
  el.dataset.kb = "1";
  const type = (el.getAttribute("type") || "text").toLowerCase();
  if (el.tagName === "INPUT" && SKIP.has(type)) return;
  const set = (k, v) => { if (!el.hasAttribute(k)) el.setAttribute(k, v); };
  const plain = () => { set("autocorrect", "off"); set("spellcheck", "false"); };
  if (el.tagName === "TEXTAREA"){ set("autocapitalize", "sentences"); set("enterkeyhint", "enter"); return; }
  const im = (el.getAttribute("inputmode") || "").toLowerCase(), ac = (el.getAttribute("autocomplete") || "").toLowerCase(), id = el.id || "";
  const key = id + " " + Object.keys(el.dataset).join(" ");
  if (ac === "one-time-code"){
    plain(); set("autocapitalize", "off"); set("pattern", "[0-9]*"); set("enterkeyhint", "go");
    el.addEventListener("input", () => { const v = el.value.replace(/\D/g, "").slice(0, 8); if (v !== el.value) el.value = v; });
    return;
  }
  if (type === "email" || /mail/i.test(id)){ plain(); set("inputmode", "email"); set("autocapitalize", "off"); set("autocomplete", "email"); set("enterkeyhint", "done"); return; }
  if (type === "search"){ plain(); set("autocapitalize", "off"); set("autocomplete", "off"); set("enterkeyhint", "search"); return; }
  if (im === "tel" || type === "tel"){ plain(); set("autocomplete", "tel"); set("enterkeyhint", "done"); return; }
  if (im === "decimal" || im === "numeric"){ plain(); set("autocapitalize", "off"); set("autocomplete", "off"); if (im === "numeric") set("pattern", "[0-9]*"); set("enterkeyhint", "done"); return; }
  if ((el.getAttribute("autocapitalize") || "") === "characters"){ plain(); set("autocomplete", "off"); set("enterkeyhint", "done"); return; }
  if (el.dataset.sug || NAME_RX.test(key)){ plain(); set("autocapitalize", "words"); set("autocomplete", "off"); set("enterkeyhint", "done"); return; }
  set("autocapitalize", "sentences"); set("enterkeyhint", "done");
}
const tuneAll = r => { if (r.matches && r.matches("input,textarea")) tune(r); if (r.querySelectorAll) r.querySelectorAll("input,textarea").forEach(tune); };
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) tuneAll(n); })
  .observe(root, { childList:true, subtree:true });
document.addEventListener("DOMContentLoaded", () => tuneAll(document));
tuneAll(document);

/* Enter num campo simples de uma janela fecha o teclado (em vez de não fazer nada) */
document.addEventListener("keydown", e => {
  if (e.defaultPrevented || e.key !== "Enter" || e.isComposing) return;
  const t = e.target;
  if (t.tagName !== "INPUT" || !t.closest(".sh-b") || (t.dataset.sug && document.querySelector(".sug .on"))) return;
  e.preventDefault(); t.blur();
});

/* ---------- 2. altura do teclado ---------- */
let kb = 0;
function setKb(h){
  h = Math.max(0, Math.round(h || 0));
  if (Math.abs(h - kb) < 2) return;
  kb = h;
  root.style.setProperty("--kb", h + "px");
  root.classList.toggle("kb-open", h > 60);
  if (h > 60) setTimeout(() => reveal(document.activeElement), 60);
  window.dispatchEvent(new CustomEvent("cw-keyboard", { detail:h }));
}
window.__cwKb = setKb;                    // chamado pela app iOS (notificações nativas do teclado)
if (!native && window.visualViewport){
  const vv = window.visualViewport;
  const upd = () => {
    const h = window.innerHeight - vv.height - vv.offsetTop;
    setKb(h > 60 ? h : 0);
    if (root.classList.contains("fixed-layout") && window.scrollY) window.scrollTo(0, 0);   // o Safari não deve mover a página fixa
  };
  vv.addEventListener("resize", upd); vv.addEventListener("scroll", upd);
}

/* ---------- 3. manter o campo ativo visível ---------- */
function scrollParent(el){
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement){
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}
function reveal(el){
  if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
  const sp = scrollParent(el);
  if (!sp){ if (!root.classList.contains("fixed-layout")) el.scrollIntoView({ block:"nearest" }); return; }
  const r = el.getBoundingClientRect(), pr = sp.getBoundingClientRect();
  const visBottom = Math.min(pr.bottom, window.innerHeight - kb) - 12, visTop = pr.top + 12;
  const extra = el.dataset.sug ? 200 : 0;              // espaço para a lista de sugestões
  if (r.bottom + extra > visBottom) sp.scrollTop += r.bottom + extra - visBottom;
  else if (r.top < visTop) sp.scrollTop -= visTop - r.top;
}
document.addEventListener("focusin", e => { setTimeout(() => reveal(e.target), kb ? 30 : 320); });
window.cwReveal = reveal;
})();
