/* Mr Clean Wolf — ligação ao Supabase para a app de gestão.
   Fornece a mesma interface que a app usava no claude.ai (claude.use("db"|"assets"|"downloads"|"portal"|"pedidos"|"agenda")),
   para que o código da app se mantenha igual nas duas versões. */
(() => {
"use strict";
const CFG = window.CW_CONFIG || {};
const configured = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && !/XXXX/.test(CFG.supabaseUrl) && !/COLE/.test(CFG.supabaseAnonKey));
const sb = configured ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:false } }) : null;
window.__sb = sb;

/* ---------- ecrã de entrada (código por e-mail) ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function overlay(html){
  let el = document.getElementById("cw-login");
  if (!el){ el = document.createElement("div"); el.id = "cw-login"; document.body.appendChild(el); }
  el.setAttribute("style","position:fixed;inset:0;z-index:50;background:#121212;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Manrope,system-ui,sans-serif;color:#F3ECE3");
  el.innerHTML = `<div style="width:100%;max-width:380px;display:grid;gap:16px">
    <div style="display:flex;align-items:center;gap:10px"><img src="../icons/wolf.png" alt="" style="width:64px;height:55px;object-fit:contain">
    <div style="line-height:1"><div style="font:600 11px Syne,sans-serif;letter-spacing:.3em;color:#E9AC3C">MR</div><div style="font:800 24px Syne,sans-serif">CLEAN WOLF</div></div></div>
    <div style="display:flex;flex-direction:column;gap:3px"><span style="height:4px;background:#6B0F1F"></span><span style="height:1px;background:#E9AC3C"></span></div>
    ${html}</div>`;
  return el;
}
const inputCss = "width:100%;box-sizing:border-box;min-height:48px;border:1px solid #3A3632;background:#262422;color:#F3ECE3;border-radius:12px;padding:0 14px;font:16px Manrope,sans-serif";
const btnCss = "min-height:48px;border-radius:12px;border:1px solid #9B1B30;background:#6B0F1F;color:#fff;font:700 16px Manrope,sans-serif;cursor:pointer";
function loginUI(){
  return new Promise(resolve => {
    const stepEmail = (msg) => {
      const el = overlay(`<h1 style="margin:0;font:700 24px Syne,sans-serif">Gestão</h1>
        <label style="display:grid;gap:6px"><span style="font-size:13px;color:#A99F94">E-mail</span><input id="cw-email" type="email" autocomplete="email" style="${inputCss}"></label>
        <button id="cw-send" style="${btnCss}">Enviar código</button>
        <p style="margin:0;font-size:13px;color:${msg?"#F28B7D":"#A99F94"}">${esc(msg||"Recebe um código de 6 dígitos no seu e-mail.")}</p>`);
      const go = async () => {
        const email = el.querySelector("#cw-email").value.trim().toLowerCase(); if (!email) return;
        el.querySelector("#cw-send").disabled = true;
        const { error } = await sb.auth.signInWithOtp({ email, options:{ shouldCreateUser:false } });
        if (error) stepEmail("Não foi possível enviar o código: " + error.message); else stepCode(email);
      };
      el.querySelector("#cw-send").onclick = go;
      el.querySelector("#cw-email").onkeydown = e => { if (e.key === "Enter") go(); };
      el.querySelector("#cw-email").focus();
    };
    const stepCode = (email, msg) => {
      const el = overlay(`<h1 style="margin:0;font:700 24px Syne,sans-serif">Código de acesso</h1>
        <p style="margin:0;font-size:14px;color:#A99F94">Enviámos um código para ${esc(email)}.</p>
        <input id="cw-code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" style="${inputCss};letter-spacing:.3em;font-size:22px;text-align:center">
        <button id="cw-ok" style="${btnCss}">Entrar</button>
        <button id="cw-back" style="${btnCss};background:#262422;border-color:#3A3632">Usar outro e-mail</button>
        ${msg?`<p style="margin:0;font-size:13px;color:#F28B7D">${esc(msg)}</p>`:""}`);
      const go = async () => {
        const token = el.querySelector("#cw-code").value.trim(); if (!token) return;
        const { data, error } = await sb.auth.verifyOtp({ email, token, type:"email" });
        if (error) stepCode(email, "Código inválido ou expirado."); else { el.remove(); resolve(data.session); }
      };
      el.querySelector("#cw-ok").onclick = go;
      el.querySelector("#cw-code").onkeydown = e => { if (e.key === "Enter") go(); };
      el.querySelector("#cw-back").onclick = () => stepEmail();
      el.querySelector("#cw-code").focus();
    };
    stepEmail();
  });
}
/* ---------- desbloqueio com Face ID (só na app iOS) ---------- */
const nativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
let locking = null, hiddenAt = 0;
function faceLock(){
  if (!nativeApp) return Promise.resolve(true);
  if (locking) return locking;
  locking = new Promise(resolve => {
    const el = overlay(`<p style="margin:0;color:#A99F94">A app está bloqueada.</p><button id="cw-unlock" style="${btnCss}">Desbloquear com Face ID</button>`);
    const tryIt = async () => {
      try { const r = await window.Capacitor.nativePromise("CWNative", "biometric", { reason:"Desbloquear a gestão Mr Clean Wolf" }); if (r && r.ok){ el.remove(); locking = null; resolve(true); } }
      catch(e){ console.error(e); }
    };
    el.querySelector("#cw-unlock").onclick = tryIt; tryIt();
  });
  return locking;
}
if (nativeApp) document.addEventListener("visibilitychange", () => {
  if (document.hidden){ hiddenAt = Date.now(); return; }
  if (hiddenAt && Date.now() - hiddenAt > 60000 && authP) faceLock();   // bloqueia após 1 minuto fora da app
});

async function ensureAuth(){
  if (!sb){ overlay(`<p style="margin:0">A app ainda não está ligada à base de dados. Preencha o ficheiro <b>config.js</b> (ver README).</p>`); return null; }
  let { data:{ session } } = await sb.auth.getSession();
  if (!session && !navigator.onLine) return "offline";
  if (!session) session = await loginUI();
  else await faceLock();
  const { data, error } = await sb.from("admins").select("email").limit(1);
  if (error && navigator.onLine){ overlay(`<p style="margin:0">Não foi possível verificar o acesso: ${esc(error.message)}</p>`); return null; }
  if (!error && (!data || !data.length)){
    overlay(`<p style="margin:0">Esta conta não tem acesso à gestão.</p><button id="cw-out" style="${btnCss}">Terminar sessão</button>`);
    document.getElementById("cw-out").onclick = async () => { await sb.auth.signOut(); location.reload(); };
    return null;
  }
  return session;
}
let authP = null; const auth = () => authP || (authP = ensureAuth());

/* ---------- base de dados (tabela docs: path → data jsonb) ---------- */
const CK = "cw-cache:";
const saveCache = (k, v) => { try { localStorage.setItem(CK + k, JSON.stringify(v)); } catch(e){} };
const loadCache = k => { try { const v = localStorage.getItem(CK + k); return v ? JSON.parse(v) : null; } catch(e){ return null; } };
const snap = (path, data) => ({ id: path.split("/").pop(), exists: data != null, data: () => data, metadata:{ fromCache:false, hasPendingWrites:false } });
const isObj = v => v && typeof v === "object" && !Array.isArray(v);
function deepMerge(a, b){ const o = Object.assign({}, a); for (const [k, v] of Object.entries(b)){ o[k] = (isObj(v) && isObj(o[k])) ? deepMerge(o[k], v) : v; } return o; }
const listeners = new Set();
let channel = null;
function ensureChannel(){
  if (channel) return;
  channel = sb.channel("docs-changes").on("postgres_changes", { event:"*", schema:"public", table:"docs" }, p => {
    const path = (p.new && p.new.path) || (p.old && p.old.path); if (!path) return;
    for (const l of listeners) if (l.matches(path)) l.refresh();
  }).subscribe();
  window.addEventListener("online", () => { for (const l of listeners) l.refresh(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) for (const l of listeners) l.refresh(); });
}
function localRefresh(path){ for (const l of listeners) if (l.matches(path)) l.refresh(); }
async function getDoc(path){
  const { data, error } = await sb.from("docs").select("data").eq("path", path).maybeSingle();
  if (error) throw error;
  return data ? data.data : null;
}
async function setDoc(path, data){
  const { error } = await sb.from("docs").upsert({ path, data, updated_at: new Date().toISOString() });
  if (error) throw error;
  localRefresh(path);
}
const db = {
  collection(c){
    return { onSnapshot(cb, err){
      const l = { matches: p => p.startsWith(c + "/"), refresh: async () => {
        try {
          const { data, error } = await sb.from("docs").select("path,data").like("path", c + "/%");
          if (error) throw error;
          saveCache("c:" + c, data); cb({ docs: data.map(r => snap(r.path, r.data)), size: data.length, empty: !data.length });
        } catch(e){
          const d = loadCache("c:" + c); if (d) cb({ docs: d.map(r => snap(r.path, r.data)), size: d.length, empty: !d.length }); else if (err) err({ code:"unavailable", message:String(e.message || e) });
        } } };
      listeners.add(l); ensureChannel(); l.refresh(); return () => listeners.delete(l);
    } };
  },
  doc(path){
    return {
      get: async () => snap(path, await getDoc(path)),
      set: async d => setDoc(path, d),
      update: async d => { const cur = await getDoc(path); if (cur == null) throw { code:"invalid_argument", message:"Documento inexistente" }; await setDoc(path, deepMerge(cur, d)); },
      delete: async () => { const { error } = await sb.from("docs").delete().eq("path", path); if (error) throw error; localRefresh(path); },
      onSnapshot(cb, err){
        const l = { matches: p => p === path, refresh: async () => {
          try { const d = await getDoc(path); saveCache("d:" + path, d); cb(snap(path, d)); }
          catch(e){ const d = loadCache("d:" + path); if (d !== null) cb(snap(path, d)); else if (err) err({ code:"unavailable", message:String(e.message || e) }); } } };
        listeners.add(l); ensureChannel(); l.refresh(); return () => listeners.delete(l);
      }
    };
  }
};

/* ---------- fotografias (Storage privado "fotos") ---------- */
const assets = {
  async upload(blob, opts){
    const folder = String(window.__photoFolder || "geral").replace(/[^A-Za-z0-9_-]/g, "");
    const path = `${folder}/${(crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2))}.jpg`;
    const { error } = await sb.storage.from("fotos").upload(path, blob, { contentType:(opts && opts.type) || blob.type || "image/jpeg", upsert:false });
    if (error) throw error;
    return { id: path, url: "", sizeBytes: blob.size, contentType: blob.type };
  },
  async delete(id){ const { error } = await sb.storage.from("fotos").remove([id]); if (error) throw error; return { deleted:true }; },
  async list(){ return { assets:[], usage:{} }; }
};
const signed = new Map();
let hydT = null;
async function hydrate(){
  if (!sb) return;
  const imgs = [...document.querySelectorAll("img[data-path]:not([src])")].filter(i => i.dataset.path);
  if (!imgs.length) return;
  const now = Date.now(), need = [...new Set(imgs.map(i => i.dataset.path))].filter(p => !(signed.has(p) && signed.get(p).exp > now));
  if (need.length){
    const { data } = await sb.storage.from("fotos").createSignedUrls(need, 3600);
    for (const r of data || []) if (r.signedUrl) signed.set(r.path, { url:r.signedUrl, exp: now + 3300e3 });
  }
  for (const i of imgs){ const s = signed.get(i.dataset.path); if (s) i.src = s.url; }
}
new MutationObserver(() => { clearTimeout(hydT); hydT = setTimeout(hydrate, 60); }).observe(document.documentElement, { childList:true, subtree:true });

/* ---------- descargas (PDF, CSV, calendário) ---------- */
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
/* app iOS nativa (Capacitor): calendário via EventKit e partilha nativa de ficheiros */
const native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
const callNative = (method, opts) => window.Capacitor.nativePromise("CWNative", method, opts);
function icsEvents(text){
  const un = s => s.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
  const lines = String(text).replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const out = []; let ev = null;
  for (const l of lines){
    if (l === "BEGIN:VEVENT") ev = {};
    else if (l === "END:VEVENT"){ if (ev) out.push(ev); ev = null; }
    else if (ev){ const i = l.indexOf(":"); if (i < 0) continue; const k = l.slice(0, i).split(";")[0].toUpperCase(), v = l.slice(i + 1);
      if (k === "UID") ev.uid = v; else if (k === "DTSTART") ev.start = v; else if (k === "DTEND") ev.end = v;
      else if (k === "SUMMARY") ev.title = un(v); else if (k === "DESCRIPTION") ev.notes = un(v); else if (k === "LOCATION") ev.location = un(v); }
  }
  return out;
}
const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] || ""); r.onerror = rej; r.readAsDataURL(blob); });

const downloads = {
  async save({ filename, data }){
    const type = /\.ics$/i.test(filename) ? "text/calendar" : /\.csv$/i.test(filename) ? "text/csv;charset=utf-8" : /\.pdf$/i.test(filename) ? "application/pdf" : "application/octet-stream";
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    if (native){
      if (/\.ics$/i.test(filename)){
        const r = await callNative("calendar", { events: icsEvents(typeof data === "string" ? data : await blob.text()) });
        if (r && r.denied) throw { code:"declined" };
        return { status:"delivered" };
      }
      try { await callNative("share", { filename, base64: await toB64(blob) }); return { status:"delivered" }; }
      catch(e){ throw { code:"declined" }; }
    }
    if (isIOS && /\.ics$/i.test(filename)){ location.href = URL.createObjectURL(new Blob([blob], { type:"text/calendar" })); return { status:"delivered" }; }
    const file = new File([blob], filename, { type: blob.type || type });
    if (isIOS && navigator.canShare && navigator.canShare({ files:[file] })){
      try { await navigator.share({ files:[file], title: filename }); return { status:"delivered" }; }
      catch(e){ if (e && e.name === "AbortError") throw { code:"declined" }; }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    return { status:"saved" };
  }
};

/* ---------- área de cliente ---------- */
const portal = {
  async upsert(row){ const { error } = await sb.from("portal").upsert(Object.assign({}, row, { updated_at: new Date().toISOString() })); if (error) throw error; }
};

/* ---------- pedidos de marcação e dias disponíveis ---------- */
const pedidos = {
  async list(){ const { data, error } = await sb.from("pedidos").select("*").eq("estado","pendente").order("created_at"); if (error) throw error; return data || []; },
  async update(id, patch){ const { error } = await sb.from("pedidos").update(Object.assign({}, patch, { updated_at: new Date().toISOString() })).eq("id", id); if (error) throw error; },
  subscribe(cb){ return sb.channel("pedidos-changes").on("postgres_changes", { event:"*", schema:"public", table:"pedidos" }, () => cb()).subscribe(); }
};
const atualizacoes = {
  async create(cliente_id, nome){
    const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789", r = crypto.getRandomValues(new Uint8Array(12));
    const token = [...r].map(x => a[x % a.length]).join("");
    const { error } = await sb.from("atualizacoes").insert({ token, cliente_id, nome }); if (error) throw error; return token;
  },
  async list(){ const { data, error } = await sb.from("atualizacoes").select("*").eq("estado","respondido").order("respondido_at"); if (error) throw error; return data || []; },
  async update(id, estado){ const { error } = await sb.from("atualizacoes").update({ estado }).eq("id", id); if (error) throw error; }
};
const agenda = {
  async get(){ const { data, error } = await sb.from("agenda").select("dados").eq("id","config").maybeSingle(); if (error) throw error; return data ? data.dados : null; },
  async set(dados){ const { error } = await sb.from("agenda").upsert({ id:"config", dados, updated_at: new Date().toISOString() }); if (error) throw error; }
};

window.claude = {
  async use(name){
    if (name === "downloads") return downloads;
    const s = await auth();
    if (!s) return null;
    if (name === "db") return db;
    if (name === "assets") return s === "offline" ? null : assets;
    if (name === "portal") return s === "offline" ? null : portal;
    if (name === "pedidos") return s === "offline" ? null : pedidos;
    if (name === "agenda") return s === "offline" ? null : agenda;
    if (name === "atualizacoes") return s === "offline" ? null : atualizacoes;
    return null;
  }
};
})();
