/* Mr Clean Wolf — Dashboard do negócio.
   Corre dentro da app de gestão (usa S, list, est, recCost, etc.). Exporta window.CWDash = { view, wire }.
   Cores de gráfico validadas para a superfície antracite (#282B2F): série principal #BE8A2E, comparação #D0566B,
   contexto (período anterior) em cinzento. */
(() => {
"use strict";
const C_MAIN = "#BE8A2E", C_ALT = "#D0566B", C_CTX = "#5E636B", C_GRID = "#393C41", C_TXT = "#A99F94";
const PERIODS = [["30d","30 dias"],["mes","Este mês"],["trim","Trimestre"],["ano","Este ano"],["12m","12 meses"]];
const MAINT = new Set(["ext","int","wet","pele","cera"]);          // manutenção (o "engodo")
const isPremium = r => (r.extras||[]).length || (r.sv||[]).some(k => !MAINT.has(k));
let period = "30d", PH = null, phLoading = false, SOCIAL = null, socialSub = false;
try { period = localStorage.getItem("cw.dash.p") || "30d"; } catch(e){}

const D = () => window.__cw;                                          // helpers da app (definidos em index.html)
const pad = n => String(n).padStart(2, "0");
const ds = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addD = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ds(d); };
const days = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5);

function range(p){
  const t = ds(new Date()), now = new Date();
  let from;
  if (p === "30d") from = addD(t, -29);
  else if (p === "mes") from = t.slice(0, 8) + "01";
  else if (p === "trim") from = `${now.getFullYear()}-${pad(Math.floor(now.getMonth()/3)*3+1)}-01`;
  else if (p === "ano") from = `${now.getFullYear()}-01-01`;
  else from = addD(t, -364);
  const len = days(from, t) + 1, pto = addD(from, -1), pfrom = addD(pto, -(len - 1));
  return { from, to:t, pfrom, pto, len };
}

/* ---------- métricas ---------- */
function metrics(from, to){
  const h = D(), all = h.list("servicos"), done = all.filter(r => h.est(r) === "entregue");
  const inR = done.filter(r => r.d >= from && r.d <= to);
  let fat = 0, custo = 0, mo = 0, horas = 0, xs = 0;
  for (const r of inR){ const k = h.recCost(r.sv, r.cat); fat += +r.fat || 0; custo += k.custo; mo += k.mo; horas += k.horas; xs += h.extrasSum(r); }
  const first = {}; for (const r of done) if (!first[r.cli] || r.d < first[r.cli]) first[r.cli] = r.d;
  const ativos = [...new Set(inR.map(r => r.cli))];
  const novos = ativos.filter(c => first[c] >= from);
  const regressam = ativos.filter(c => first[c] < from);
  return { n: inR.length, fat, rl: fat - xs - custo - mo, horas, eh: horas ? (fat - xs - custo) / horas : 0,
    ticket: inR.length ? fat / inR.length : 0, ativos: ativos.length, novos: novos.length, regressam: regressam.length, rows: inR };
}
function occupancy(){
  const h = D(), AG = h.AG(), from = ds(new Date()), end = addD(from, 13);
  let open = 0;
  for (let d = from; d <= end; d = addD(d, 1)){
    const dow = new Date(d + "T12:00:00").getDay();
    const ok = AG ? ((AG.semana[dow] && !(AG.fechados||[]).includes(d)) || (AG.abertos||[]).includes(d)) : dow !== 0;
    if (ok) open++;
  }
  const cap = open * (AG ? (+AG.capacidade || 1) : 2);
  const used = h.list("servicos").filter(r => r.d >= from && r.d <= end && h.est(r) !== "entregue").length;
  return { open, cap, used, pct: cap ? used / cap : 0 };
}
function clientHealth(){
  const h = D(), done = h.list("servicos").filter(r => h.est(r) === "entregue").sort((a,b) => a.d.localeCompare(b.d));
  const by = {}; for (const r of done) (by[r.cli] = by[r.cli] || []).push(r);
  const gaps = [], risco = [], t = ds(new Date());
  let startedMaint = 0, upsold = 0;
  for (const [cli, rs] of Object.entries(by)){
    for (let i = 1; i < rs.length; i++) gaps.push(days(rs[i-1].d, rs[i].d));
    const lastD = rs[rs.length-1].d, since = days(lastD, t), fat = rs.reduce((a,r) => a + (+r.fat||0), 0);
    if (rs.length >= 2 && since > 90 && since < 540) risco.push({ cli, since, n: rs.length, fat, lastD });
    if (!isPremium(rs[0])){ startedMaint++; if (rs.slice(1).some(isPremium)) upsold++; }
  }
  gaps.sort((a,b) => a - b);
  const med = gaps.length ? gaps[Math.floor(gaps.length/2)] : 0;
  risco.sort((a,b) => b.fat - a.fat);
  return { freq: med, risco, upsell: startedMaint ? upsold / startedMaint : 0, upsold, startedMaint };
}
function mix(rows){
  const h = D(), P = (h.S().cfg||{}).precos || {}, m = {};
  for (const r of rows){
    const tab = P[r.cat||"C"] || {}, ks = r.sv || [], tot = ks.reduce((a,k) => a + (+tab[k]||0), 0), base = Math.max(0, (+r.fat||0) - h.extrasSum(r));
    for (const k of ks){ const v = tot ? base * (+tab[k]||0) / tot : base / ks.length; m[k] = m[k] || { n:0, v:0 }; m[k].n++; m[k].v += v; }
    if ((r.extras||[]).length){ m._x = m._x || { n:0, v:0 }; m._x.n++; m._x.v += h.extrasSum(r); }
  }
  return Object.entries(m).map(([k,o]) => ({ k, l: k === "_x" ? "Produtos à parte (cerâmicas…)" : (h.SVK[k] ? h.SVK[k].l : k), ...o })).sort((a,b) => b.v - a.v);
}
function monthly(){
  const h = D(), done = h.list("servicos").filter(r => h.est(r) === "entregue"), now = new Date(), out = [];
  for (let i = 11; i >= 0; i--){
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1), key = `${d.getFullYear()}-${pad(d.getMonth()+1)}`, pkey = `${d.getFullYear()-1}-${pad(d.getMonth()+1)}`;
    let a = 0, b = 0, n = 0; for (const r of done){ const k = r.d.slice(0,7); if (k === key){ a += +r.fat||0; n++; } else if (k === pkey) b += +r.fat||0; }
    out.push({ l: h.MES3[d.getMonth()], key, a, b, n });
  }
  return out;
}

/* ---------- desenho ---------- */
const fmtPct = v => (v >= 0 ? "+" : "") + Math.round(v * 100) + " %";
function delta(cur, prev, invert, vsTxt){
  if (!prev) return `<span class="dl">sem comparação</span>`;
  const d = (cur - prev) / Math.abs(prev), good = invert ? d <= 0 : d >= 0;
  return `<span class="dl ${good ? "up" : "down"}"><span aria-hidden="true">${d >= 0 ? "▲" : "▼"}</span> ${fmtPct(d)} <span class="vs">${vsTxt || "vs período anterior"}</span></span>`;
}
function spark(vals, color){
  const W = 120, H = 32, mx = Math.max(1, ...vals), n = vals.length;
  const pts = vals.map((v,i) => `${(i/(n-1||1))*(W-4)+2},${H-3-(v/mx)*(H-8)}`).join(" ");
  return `<svg class="spk" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pts.split(" ").pop().split(",")[0]}" cy="${pts.split(" ").pop().split(",")[1]}" r="3" fill="${color}"/></svg>`;
}
function tile(label, value, sub, extra){ return `<div class="kpi dk"><span class="lbl">${label}</span><span class="v">${value}</span>${sub||""}${extra||""}</div>`; }

function lineChart(ms){
  const h = D(), W = 640, H = 220, pl = 46, pr = 12, pt = 14, pb = 26, n = ms.length;
  const max = Math.max(1, ...ms.map(m => Math.max(m.a, m.b))), step = h.niceStep(max / 3), top = Math.ceil(max / step) * step;
  const x = i => pl + (W - pl - pr) * i / (n - 1), y = v => pt + (H - pt - pb) * (1 - v / top);
  let g = ""; for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="${C_GRID}" stroke-width="1"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end" fill="${C_TXT}" font-size="11">${h.nf0.format(v)}</text>`;
  const path = k => ms.map((m,i) => `${i ? "L" : "M"}${x(i)},${y(m[k])}`).join("");
  const labels = ms.map((m,i) => (i % 2 === (n-1) % 2) ? `<text x="${x(i)}" y="${H-7}" text-anchor="middle" fill="${C_TXT}" font-size="11">${m.l}</text>` : "").join("");
  const last = ms[n-1];
  return `<div class="lc" data-lc='${JSON.stringify(ms.map(m => [m.l + " " + m.key.slice(0,4), m.a, m.b, m.n]))}'>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Faturado por mês nos últimos 12 meses, comparado com o ano anterior">${g}
    <path d="${path("b")}" fill="none" stroke="${C_CTX}" stroke-width="2" stroke-linejoin="round"/>
    <path d="${path("a")}" fill="none" stroke="${C_MAIN}" stroke-width="2.5" stroke-linejoin="round"/>
    ${ms.map((m,i) => `<circle cx="${x(i)}" cy="${y(m.a)}" r="4" fill="${C_MAIN}" stroke="#282B2F" stroke-width="2"/>`).join("")}
    <text x="${x(n-1)-10}" y="${Math.max(pt+12, y(last.a)-14)}" text-anchor="end" fill="#F3ECE3" font-size="12" font-weight="700">${h.eur0(last.a)}</text>
    ${labels}<line class="xh" x1="0" x2="0" y1="${pt}" y2="${H-pb}" stroke="#8A8F98" stroke-width="1" opacity="0"/></svg>
    <div class="tip" hidden></div></div>`;
}
function hbars(items, fmt){
  const mx = Math.max(1, ...items.map(i => i.v));
  return `<div class="hb2">${items.map(i => `<div class="r" title="${i.l}: ${fmt(i.v)}"><span class="l">${i.l}</span><span class="t"><i style="width:${i.v ? Math.max(2, i.v/mx*100) : 0}%"></i></span><span class="n">${fmt(i.v)}</span></div>`).join("")}</div>`;
}

/* ---------- redes sociais (registo manual até haver ligação automática) ---------- */
const NETS = [["instagram","Instagram"],["facebook","Facebook"],["tiktok","TikTok"],["google","Perfil Google"]];
const NET_F = { instagram:[["seg","Seguidores"],["alcance","Alcance"],["interacoes","Interações"],["posts","Publicações"],["mensagens","Mensagens / pedidos"]],
  facebook:[["seg","Seguidores"],["alcance","Alcance"],["interacoes","Interações"],["posts","Publicações"],["mensagens","Mensagens / pedidos"]],
  tiktok:[["seg","Seguidores"],["alcance","Visualizações"],["interacoes","Interações"],["posts","Vídeos"],["mensagens","Mensagens / pedidos"]],
  google:[["seg","Avaliações"],["alcance","Visualizações do perfil"],["interacoes","Chamadas e direções"],["posts","Publicações"],["mensagens","Nota média (1–5)"]] };
function socialSection(){
  const h = D(), red = (SOCIAL && SOCIAL.redes) || {};
  const cards = NETS.map(([k,l]) => {
    const r = red[k] || {}, ms = Object.keys(r.registos || {}).sort(), last = ms.length ? r.registos[ms[ms.length-1]] : null, prev = ms.length > 1 ? r.registos[ms[ms.length-2]] : null;
    const F = NET_F[k];
    if (!last) return `<div class="card sc"><div class="card-h"><span class="lbl">${l}</span>${r.handle ? `<span class="note">${h.esc(r.handle)}</span>` : ""}</div><p class="note" style="margin:0">Ainda sem registos.</p><button class="btn sm" type="button" data-soc="${k}">Registar mês</button></div>`;
    const eng = last.alcance ? (last.interacoes || 0) / last.alcance : 0;
    return `<div class="card sc"><div class="card-h"><span class="lbl">${l}</span><span class="note">${h.esc(r.handle || "")} · ${ms[ms.length-1].slice(5)}/${ms[ms.length-1].slice(0,4)}</span></div>
      <div class="scv"><b>${h.nf0.format(last.seg || 0)}</b><span>${F[0][1].toLowerCase()}</span>${prev ? delta(last.seg||0, prev.seg||0, false, "vs mês anterior") : ""}</div>
      ${ms.length > 1 ? spark(ms.map(m => +r.registos[m].seg || 0), C_MAIN) : ""}
      <div class="kv"><span>${F[1][1]}</span><span>${h.nf0.format(last.alcance || 0)}</span>${k === "google" ? `<span>${F[4][1]}</span><span>${last.mensagens || "—"}</span>` : `<span>Envolvimento</span><span>${eng ? (eng*100).toFixed(1).replace(".",",") + " %" : "—"}</span><span>${F[4][1]}</span><span>${h.nf0.format(last.mensagens || 0)}</span>`}</div>
      <button class="btn sm" type="button" data-soc="${k}">Registar mês</button></div>`;
  }).join("");
  return `<h2 class="dsh">Redes sociais</h2>
    <p class="note" style="margin:-4px 0 10px">Registo mensal manual. A ligação automática às contas da marca é configurada numa fase seguinte.</p>
    <div class="socg">${cards}</div>`;
}
function editSocial(k){
  const h = D(), l = NETS.find(n => n[0] === k)[1], F = NET_F[k];
  const red = JSON.parse(JSON.stringify((SOCIAL && SOCIAL.redes) || {})); red[k] = red[k] || { handle:"", registos:{} };
  const now = new Date(), mKey = `${now.getFullYear()}-${pad(now.getMonth()+1)}`, cur = red[k].registos[mKey] || {};
  const body = `<label class="fld"><span class="lbl">Conta</span><input id="so-h" value="${h.esc(red[k].handle || "")}" placeholder="${k === "google" ? "Nome do perfil" : "@mrcleanwolf"}" autocapitalize="off"></label>
    <label class="fld"><span class="lbl">Mês</span><input id="so-m" type="month" value="${mKey}"></label>
    <div class="two">${F.map(([f,t]) => `<label class="fld"><span class="lbl">${t}</span><input data-sf="${f}" inputmode="decimal" value="${cur[f] ?? ""}"></label>`).join("")}</div>
    <p class="note">Os valores estão nas estatísticas de cada rede (Instagram: Painel profissional; Facebook: Meta Business Suite; Google: Perfil da empresa).</p>`;
  h.openSheet(`${l} — registo mensal`, body, `<span class="sp"></span><button class="btn" type="button" id="sh-cancel">Cancelar</button><button class="btn pri" type="button" id="sh-save">Guardar</button>`, close => {
    h.$("#sh-cancel").onclick = close;
    h.$("#so-m").onchange = e => { const r = red[k].registos[e.target.value] || {}; document.querySelectorAll("[data-sf]").forEach(i => i.value = r[i.dataset.sf] ?? ""); };
    h.$("#sh-save").onclick = async () => {
      const m = h.$("#so-m").value; if (!m){ h.toast("Indique o mês."); return; }
      const rec = {}; document.querySelectorAll("[data-sf]").forEach(i => { if (i.value.trim() !== "") rec[i.dataset.sf] = h.numIn(i.value); });
      red[k].handle = h.$("#so-h").value.trim(); red[k].registos[m] = rec;
      close();
      try { await h.db().doc("config/social").set(Object.assign({}, SOCIAL || {}, { redes: red })); h.toast("Registo guardado."); }
      catch(e){ h.writeErr(e); }
    };
  });
}

/* ---------- vista ---------- */
function view(){
  const h = D();
  if (!socialSub && h.db()){ socialSub = true; h.db().doc("config/social").onSnapshot(s => { SOCIAL = s.exists ? s.data() : null; h.schedule(); }, () => {}); }
  const R = range(period), cur = metrics(R.from, R.to), prev = metrics(R.pfrom, R.pto), occ = occupancy(), ch = clientHealth();
  const ms = monthly(), mx = mix(cur.rows).slice(0, 8);
  const wd = [0,0,0,0,0,0,0]; for (const r of cur.rows) wd[new Date(r.d + "T12:00:00").getDay()]++;
  const WD = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"], order = [1,2,3,4,5,6,0];
  const top = Object.entries(cur.rows.reduce((a,r) => (a[r.cli] = (a[r.cli]||0) + (+r.fat||0), a), {})).sort((a,b) => b[1]-a[1]).slice(0,5);
  const pend = h.list("servicos").filter(r => h.fatEst(r) === "por_emitir"), pendV = pend.reduce((a,r) => a + (+r.fat||0), 0);
  const P = (h.S().custos && h.S().custos.produtos) || {}; let stockV = 0;
  for (const [id,p] of Object.entries(P)){ if (p.stockDe || !p.contagem) continue; const e = h.stockEstimate(id); if (e) stockV += e.left * (+p.preco||0); }
  // pedidos online
  if (!PH && !phLoading && h.pedidosApi()){ phLoading = true; h.pedidosApi().historico(addD(R.to, -400) + "T00:00:00Z").then(d => { PH = d; h.schedule(); }).catch(() => { PH = []; }).finally(() => { phLoading = false; }); }
  let ped = "";
  if (PH){
    const inP = PH.filter(p => p.created_at.slice(0,10) >= R.from), ac = inP.filter(p => p.estado === "aceite").length, re = inP.filter(p => p.estado === "recusado").length;
    const resp = inP.filter(p => p.estado !== "pendente" && p.updated_at).map(p => (new Date(p.updated_at) - new Date(p.created_at)) / 36e5).sort((a,b) => a-b);
    const med = resp.length ? resp[Math.floor(resp.length/2)] : null;
    ped = `<div class="kpis k4">${tile("Pedidos recebidos", inP.length, `<span class="h">pela área de cliente</span>`)}${tile("Aceites", ac, `<span class="h">${inP.length ? Math.round(ac/inP.length*100) + " % dos pedidos" : "—"}</span>`)}${tile("Recusados", re, `<span class="h">${inP.length - ac - re} por responder</span>`)}${tile("Tempo de resposta", med == null ? "—" : med < 1 ? "< 1 h" : med < 48 ? Math.round(med) + " h" : Math.round(med/24) + " dias", `<span class="h">mediana</span>`)}</div>`;
  } else if (h.pedidosApi()) ped = `<p class="note">A carregar os pedidos…</p>`;
  const tabs = `<div class="seg" role="tablist" aria-label="Período">${PERIODS.map(([k,l]) => `<button type="button" data-dp="${k}" aria-pressed="${period===k}">${l}</button>`).join("")}</div>`;
  return h.header("Dashboard", `${h.fmtD(R.from)} a ${h.fmtD(R.to)}<span class="hide-s"> · comparado com os ${R.len} dias anteriores</span>`) + `<div class="tools">${tabs}</div>
  <div class="kpis k4">
    <div class="kpi hero dk"><span class="lbl">Faturado</span><span class="v">${h.eur0(cur.fat)}</span>${delta(cur.fat, prev.fat)}</div>
    ${tile("Resultado líquido", `<span class="${cur.rl < 0 ? "neg" : "gold"}">${h.eur0(cur.rl)}</span>`, delta(cur.rl, prev.rl))}
    ${tile("Serviços entregues", cur.n, delta(cur.n, prev.n), `<span class="h">${h.nf1 ? h.nf1.format(cur.n / (R.len / 7)) : (cur.n / (R.len / 7)).toFixed(1)} por semana</span>`)}
    ${tile("Ticket médio", h.eur(cur.ticket), delta(cur.ticket, prev.ticket))}
    ${tile("Ganho por hora", h.nf2.format(cur.eh) + " €", `<span class="h">meta ${h.nf2.format(+h.CU().valorHora||0)} €/h · ${h.nf0.format(cur.horas)} h</span>`)}
    ${tile("Agenda — próximos 14 dias", Math.round(occ.pct*100) + " %", `<span class="h">${occ.used} de ${occ.cap} vagas marcadas</span>`, `<span class="meter" role="img" aria-label="${Math.round(occ.pct*100)} % ocupado"><i style="width:${Math.min(100, occ.pct*100)}%"></i></span>`)}
    ${tile("Faturas por emitir", h.eur0(pendV), `<span class="h">${pend.length} ${pend.length === 1 ? "serviço" : "serviços"}</span>`)}
    ${tile("Stock em armazém", h.eur0(stockV), `<span class="h">valor estimado</span>`)}
  </div>
  <section class="card chart" style="margin-top:12px"><div class="card-h"><span class="lbl">Faturado por mês</span><span class="lg"><span><i style="background:${C_MAIN}"></i>Últimos 12 meses</span><span><i style="background:${C_CTX}"></i>Ano anterior</span></span></div>${lineChart(ms)}</section>
  <h2 class="dsh">Clientes</h2>
  <div class="kpis k4">
    ${tile("Clientes atendidos", cur.ativos, delta(cur.ativos, prev.ativos))}
    ${tile("Clientes novos", cur.novos, `<span class="h">${cur.regressam} regressaram</span>`)}
    ${tile("Manutenção → serviço maior", Math.round(ch.upsell*100) + " %", `<span class="h">${ch.upsold} de ${ch.startedMaint} clientes que começaram pela manutenção</span>`)}
    ${tile("Intervalo entre visitas", ch.freq ? ch.freq + " dias" : "—", `<span class="h">mediana por cliente</span>`)}
  </div>
  <div class="grid2">
    <section class="card"><div class="card-h"><span class="lbl">Receita por serviço</span><span class="note">no período</span></div>${mx.length ? hbars(mx, v => h.eur0(v)) : `<p class="note">Sem serviços no período.</p>`}</section>
    <section class="card"><div class="card-h"><span class="lbl">Dias mais procurados</span><span class="note">serviços no período</span></div>${hbars(order.map(i => ({ l: WD[i], v: wd[i] })), v => String(v))}</section>
    <section class="card"><div class="card-h"><span class="lbl">Melhores clientes</span><span class="note">no período</span></div>${top.length ? top.map(([c,v]) => `<button class="row" type="button" data-dcli="${h.esc(c)}" style="grid-template-columns:minmax(0,1fr) auto"><span class="nm">${h.esc(c)}</span><span class="r-amt"><b>${h.eur0(v)}</b></span></button>`).join("") : `<p class="note">Sem serviços no período.</p>`}</section>
    <section class="card"><div class="card-h"><span class="lbl">Clientes a recuperar</span><span class="note">2+ serviços, sem visita há 90+ dias</span></div>${ch.risco.length ? ch.risco.slice(0,6).map(r => `<button class="row" type="button" data-dcli="${h.esc(r.cli)}" style="grid-template-columns:minmax(0,1fr) auto"><span><span class="nm">${h.esc(r.cli)}</span><span class="r-sub">${r.n} serviços · último há ${r.since} dias</span></span><span class="r-amt"><b>${h.eur0(r.fat)}</b></span></button>`).join("") : `<p class="note">Nenhum cliente habitual está afastado.</p>`}</section>
  </div>
  ${h.pedidosApi() ? `<h2 class="dsh">Marcações online</h2>${ped}` : ""}
  ${socialSection()}`;
}

/* tooltip do gráfico de linha (toque e rato) */
function wire(root){
  root.querySelectorAll(".lc").forEach(lc => {
    const data = JSON.parse(lc.dataset.lc), svg = lc.querySelector("svg"), tip = lc.querySelector(".tip"), xh = lc.querySelector(".xh"), h = D();
    const show = ev => {
      const r = svg.getBoundingClientRect(), W = 640, pl = 46, pr = 12, n = data.length;
      const px = (ev.clientX - r.left) / r.width * W, i = Math.max(0, Math.min(n-1, Math.round((px - pl) / (W - pl - pr) * (n-1))));
      const x = pl + (W - pl - pr) * i / (n-1); xh.setAttribute("x1", x); xh.setAttribute("x2", x); xh.setAttribute("opacity", 1);
      const [l, a, b, cnt] = data[i];
      tip.innerHTML = `<b>${l}</b><span><i style="background:${C_MAIN}"></i>${h.eur0(a)} · ${cnt} serv.</span><span><i style="background:${C_CTX}"></i>ano anterior ${h.eur0(b)}</span>`;
      tip.hidden = false; const left = x / W * r.width; tip.style.left = Math.min(r.width - 170, Math.max(0, left - 85)) + "px";
    };
    svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
    svg.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("opacity", 0); });
  });
}
function click(e){
  const p = e.target.closest("[data-dp]"); if (p){ period = p.dataset.dp; try { localStorage.setItem("cw.dash.p", period); } catch(x){} D().schedule(); return true; }
  const s = e.target.closest("[data-soc]"); if (s){ editSocial(s.dataset.soc); return true; }
  const c = e.target.closest("[data-dcli]"); if (c){ const k = D().clientByName(c.dataset.dcli); if (k) D().openCliente(k._id); return true; }
  return false;
}
window.CWDash = { view, wire, click, refresh(){ PH = null; } };
})();
