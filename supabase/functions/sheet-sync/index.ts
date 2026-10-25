// Mr Clean Wolf — lançamentos novos da folha raiz (Google Sheets «Mr. Clean Wolf Services») → app de gestão.
// Lê as abas «Compras» e «Banco» e junta à base de dados (docs compras/<ano> e movimentos/<ano>) só o que é novo.
// Nunca altera nem apaga o que já está na app.
//
// Segredos (Edge Functions → Secrets) — E4: nada disto vai para a app nem para o repositório:
//   GSHEET_SA_JSON   chave JSON da conta de serviço Google (só leitura; a folha é partilhada com o e-mail dela como «Leitor»)
//   GSHEET_ID        (opcional) ID da folha; por defeito, a folha do negócio
//
// Regras de importação:
//   • cada bloco (Compras; Banco → conta Principal, colunas A:D; Banco → conta Avença, colunas F:I) tem uma marca de água:
//     o número de linhas já tratadas, guardado em config/sheet_sync;
//   • na primeira vez, a marca de água é a última linha que já existe na app (as anteriores vieram do ficheiro inicial);
//   • linhas novas só entram se não houver na app um registo igual (mesma data, mesma conta/loja, valor a menos de 1 €)
//     — evita duplicar o que foi lançado à mão nos dois lados (ex.: compra criada na app com «Lançar no banco»);
//   • linhas sem data ou sem valor são ignoradas e contadas; voltam a ser lidas até estarem completas.
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => (Deno.env.get(k) || "").trim();
function serverKey() {
  const legacy = env("SUPABASE_SERVICE_ROLE_KEY"); if (legacy) return legacy;
  const s = env("SUPABASE_SECRET_KEYS");
  try { const o = JSON.parse(s); return String(o.default || Object.values(o)[0] || ""); } catch (_) { return s; }
}
const SB = createClient(env("SUPABASE_URL"), serverKey(), { auth: { persistSession: false, autoRefreshToken: false } });
const SHEET_ID = env("GSHEET_ID") || "1vq3fGSc6dbFc_TyDShKt1GHagHsecChJV9V_9EA8ZiE";
const STATE = "config/sheet_sync";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ---------- acesso à Google Sheets API com a conta de serviço (JWT RS256) ---------- */
const b64url = (b: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof b === "string" ? new TextEncoder().encode(b) : new Uint8Array(b);
  let s = ""; for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
async function googleToken(sa: { client_email: string; private_key: string }) {
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const sig = b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim)));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claim}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("A Google recusou a chave da conta de serviço (" + (j.error_description || j.error || r.status) + ").");
  return j.access_token as string;
}
async function readSheet(token: string) {
  const H = { Authorization: "Bearer " + token };
  const meta = await (await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`, { headers: H })).json();
  if (meta.error) throw new Error(meta.error.status === "PERMISSION_DENIED" ? "A folha não está partilhada com a conta de serviço." : meta.error.message);
  const titles: string[] = (meta.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);
  const find = (n: string) => titles.find((t) => t.trim().toLowerCase() === n);   // a aba «Compras » tem um espaço no fim
  const tc = find("compras"), tb = find("banco");
  if (!tc || !tb) throw new Error("Não encontrei as abas «Compras» e «Banco» na folha.");
  const q = (r: string) => "ranges=" + encodeURIComponent(r);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${[q(`'${tc}'!A2:C`), q(`'${tb}'!A2:C`), q(`'${tb}'!F2:H`)].join("&")}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
  const j = await (await fetch(url, { headers: H })).json();
  if (j.error) throw new Error(j.error.message);
  const v = (i: number) => (j.valueRanges?.[i]?.values || []) as unknown[][];
  return { compras: v(0), principal: v(1), avenca: v(2) };
}

/* ---------- leitura das células ---------- */
function dataISO(x: unknown): string | null {
  const s = String(x ?? "").trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) { const [d, mo, y] = [+m[1], +m[2], +m[3]]; if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}
function valor(x: unknown): number | null {
  if (typeof x === "number") return isFinite(x) ? Math.round(x * 100) / 100 : null;
  let s = String(x ?? "").replace(/[€\s\u00a0\u202f]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? Math.round(n * 100) / 100 : null;
}
const norm = (t: unknown) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const vazia = (r: unknown[]) => !r || r.every((c) => String(c ?? "").trim() === "");

/* ---------- base de dados ---------- */
type Rec = Record<string, unknown> & { d: string; val: number };
async function load(coll: string) {
  const { data, error } = await SB.from("docs").select("path,data").like("path", coll + "/%");
  if (error) throw error;
  const docs = new Map<string, { ano: string; items: Record<string, Rec> }>();
  for (const r of data || []) docs.set(r.path, { ano: r.path.split("/")[1], items: { ...(r.data?.items || {}) } });
  return docs;
}
const todos = (docs: Map<string, { items: Record<string, Rec> }>) => [...docs.values()].flatMap((d) => Object.entries(d.items).map(([id, r]) => ({ id, ...r })));
const novoId = (p: string) => p + "gs" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function isAdmin(req: Request) {
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt.split(".").length !== 3) return false;
  const { data } = await SB.auth.getUser(jwt);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return false;
  const { data: a } = await SB.from("admins").select("email");
  return (a || []).some((x: { email: string }) => String(x.email).toLowerCase() === email);
}

async function sync() {
  const saRaw = env("GSHEET_SA_JSON");
  if (!saRaw) return { configurado: false, erro: "A leitura da folha ainda não está configurada (falta o segredo GSHEET_SA_JSON)." };
  let sa; try { sa = JSON.parse(saRaw); } catch (_) { throw new Error("O segredo GSHEET_SA_JSON não é um JSON válido."); }
  const folha = await readSheet(await googleToken(sa));

  const { data: st } = await SB.from("docs").select("data").eq("path", STATE).maybeSingle();
  const estado = (st?.data || {}) as { wm?: Record<string, number> };
  const wm: Record<string, number> = { ...(estado.wm || {}) };

  const compras = await load("compras"), movs = await load("movimentos");
  const exC = todos(compras), exM = todos(movs);
  const usadosC = new Set<string>(), usadosM = new Set<string>();
  const mesmoC = (d: string, loja: string, v: number) => exC.find((r) => !usadosC.has(r.id) && r.d === d && Math.abs(Math.abs(+r.val) - Math.abs(v)) < 1 && (norm(r.loja) === norm(loja) || Math.abs(Math.abs(+r.val) - Math.abs(v)) < 0.01));
  const mesmoM = (d: string, conta: string, v: number) => exM.find((r) => !usadosM.has(r.id) && r.d === d && String(r.conta || "Principal") === conta && Math.sign(+r.val) === Math.sign(v) && Math.abs(+r.val - v) < 1);

  let nC = 0, nM = 0, ign = 0, ordBase = Date.now();
  const sujos = new Set<string>();
  const put = (docs: Map<string, { ano: string; items: Record<string, Rec> }>, coll: string, id: string, rec: Rec) => {
    const path = `${coll}/${rec.d.slice(0, 4)}`;
    if (!docs.has(path)) docs.set(path, { ano: rec.d.slice(0, 4), items: {} });
    docs.get(path)!.items[id] = rec; sujos.add(path);
  };

  // linhas de um bloco → registos; na primeira vez, a marca de água é a última linha que já existe na app
  const bloco = (nome: string, linhas: unknown[][], ler: (r: unknown[]) => Rec | null, existe: (r: Rec) => { id: string } | undefined, usados: Set<string>, gravar: (r: Rec) => void) => {
    const recs = linhas.map((l) => (vazia(l) ? null : ler(l)));
    // as linhas já tratadas «gastam» o registo da app que lhes corresponde, para que uma linha nova igual
    // (ex.: dois serviços de 45 € no mesmo dia) não seja confundida com uma antiga
    const primeira = wm[nome] == null, lim = primeira ? recs.length : Math.min(wm[nome], recs.length);
    let ult = 0;
    for (let i = 0; i < lim; i++) { const r = recs[i]; if (!r) continue; const e = existe(r); if (e) { usados.add(e.id); ult = i + 1; } }
    if (primeira) wm[nome] = ult;
    if (linhas.length < wm[nome]) wm[nome] = linhas.length;   // linhas apagadas na folha
    let incompleta = -1;
    for (let i = wm[nome]; i < linhas.length; i++) {
      if (vazia(linhas[i])) continue;
      const r = recs[i];
      if (!r) { ign++; if (incompleta < 0) incompleta = i; continue; }
      if (r.val === 0) continue;   // linhas a zero não interessam
      const e = existe(r);
      if (e) { usados.add(e.id); continue; }
      gravar(r);
    }
    // a marca de água só avança até à última linha preenchida (linhas vazias no fim podem vir a ser preenchidas)
    // e pára antes da primeira linha incompleta, para a apanhar quando for completada (as seguintes não duplicam: já existem)
    let fim = linhas.length; while (fim > wm[nome] && vazia(linhas[fim - 1])) fim--;
    if (incompleta >= 0) fim = incompleta;
    wm[nome] = Math.max(wm[nome], fim);
  };

  bloco("compras", folha.compras,
    (l) => { const d = dataISO(l[0]), v = valor(l[2]), loja = String(l[1] ?? "").trim(); return d && v != null ? { d, val: Math.abs(v), loja: loja || "—" } as Rec : null; },
    (r) => mesmoC(r.d, String(r.loja), r.val), usadosC,
    (r) => { put(compras, "compras", novoId("c"), { ...r, tipo: "consumivel", nota: "", origem: "folha" }); nC++; });
  for (const [nome, conta, linhas] of [["principal", "Principal", folha.principal], ["avenca", "Avença", folha.avenca]] as const) {
    bloco(nome, linhas,
      (l) => { const d = dataISO(l[0]), v = valor(l[2]), desc = String(l[1] ?? "").trim(); return d && v != null ? { d, val: v, desc: desc || "—", conta } as Rec : null; },
      (r) => mesmoM(r.d, conta, r.val), usadosM,
      (r) => { put(movs, "movimentos", novoId("b"), { ...r, ord: ordBase++, origem: "folha" }); nM++; });
  }

  // grava só os documentos alterados (por ano), no mesmo formato que a app usa
  const agora = new Date().toISOString();
  for (const path of sujos) {
    const d = (path.startsWith("compras/") ? compras : movs).get(path)!;
    const { error } = await SB.from("docs").upsert({ path, data: { ano: d.ano, items: d.items }, updated_at: agora });
    if (error) throw error;
  }
  const { error } = await SB.from("docs").upsert({ path: STATE, data: { wm, sync_at: agora, ultimo: { compras: nC, movimentos: nM, ignoradas: ign } }, updated_at: agora });
  if (error) throw error;
  return { configurado: true, compras: nC, movimentos: nM, ignoradas: ign, sync_at: agora };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (!(await isAdmin(req))) return json({ erro: "Sem permissão." }, 403);
    return json(await sync());
  } catch (e) {
    console.error(e);
    return json({ erro: String((e as Error)?.message || e) }, 500);
  }
});
