// Mr Clean Wolf — recolha diária das estatísticas das redes sociais da marca.
// Instagram e Facebook (Meta Graph API), YouTube (YouTube Data API) e TikTok (Display API).
// Grava o resultado no documento "config/social_auto" (lido pela dashboard da app de gestão).
// As chaves de acesso ficam só nos segredos do Supabase e na tabela privada social_privado.
//
// Segredos (Edge Functions → Secrets), todos opcionais — cada rede só é recolhida se estiver configurada:
//   META_PAGE_TOKEN        token de página do Facebook (dá acesso à página e ao Instagram associado)
//   YT_API_KEY, YT_CANAL   chave da YouTube Data API e @nome ou ID do canal
//   TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET   app de programador TikTok (Login Kit)
import { createClient } from "npm:@supabase/supabase-js@2";

const SB = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const env = (k: string) => (Deno.env.get(k) || "").trim();
const G = "https://graph.facebook.com/v25.0";
const TT = "https://open.tiktokapis.com/v2";
const DOC = "config/social_auto";
const TIKTOK_REDIRECT = "https://lusowolf286.github.io/mr-clean-wolf/social/tiktok.html";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ---------- datas (fuso dos Açores) ---------- */
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Atlantic/Azores", year: "numeric", month: "2-digit", day: "2-digit" });
const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Atlantic/Azores", hour: "2-digit", hourCycle: "h23" });
const dayOf = (d: Date) => dayFmt.format(d);
const addDay = (s: string, n: number) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const epoch = (s: string) => Math.floor(new Date(s + "T00:00:00Z").getTime() / 1000);

type Dia = { seg?: number; vis?: number; inter?: number; alc?: number; novos?: number };
type Rede = { conta?: string; ligado?: boolean; erro?: string | null; ok_at?: string; ate?: string; cum?: Record<string, number>; dias: Record<string, Dia> };
type Estado = { sync_at?: string; redes: Record<string, Rede> };

const rede = (E: Estado, k: string): Rede => (E.redes[k] ||= { dias: {} });
const dia = (r: Rede, d: string): Dia => (r.dias[d] ||= {});
const addTo = (o: Dia, f: keyof Dia, v: number | null | undefined) => { if (v == null || !isFinite(v)) return; o[f] = (o[f] || 0) + v; };

/* ---------- Meta (Facebook + Instagram) ---------- */
async function gget(path: string, params: Record<string, string | number>, token: string) {
  const u = new URL(G + path);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  u.searchParams.set("access_token", token);
  const r = await fetch(u);
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "Erro Meta");
  return j;
}
async function meta(E: Estado, hoje: string, ontem: string) {
  const token = env("META_PAGE_TOKEN");
  const fb = rede(E, "facebook"), ig = rede(E, "instagram");
  if (!token) { fb.ligado = ig.ligado = false; return; }
  fb.ligado = true;
  let page: any;
  try {
    page = await gget("/me", { fields: "id,name,username,followers_count,fan_count,instagram_business_account{id,username,followers_count,media_count}" }, token);
  } catch (e) { fb.erro = ig.erro = String((e as Error).message); return; }

  /* Facebook */
  try {
    fb.conta = page.username ? "@" + page.username : page.name;
    const seg = page.followers_count ?? page.fan_count;
    if (seg != null) dia(fb, hoje).seg = seg;
    const de = fb.ate ? addDay(fb.ate, 1) : addDay(ontem, -29);
    if (de <= ontem) {
      const got: Record<string, Record<string, number>> = {};
      for (const [m, f] of [["page_media_view", "vis"], ["page_post_engagements", "inter"], ["page_total_media_view_unique", "alc"]] as const) {
        try {
          const j = await gget(`/${page.id}/insights`, { metric: m, period: "day", since: epoch(de), until: epoch(addDay(ontem, 1)) + 86400 }, token);
          for (const v of (j.data?.[0]?.values || [])) {
            const d = addDay(String(v.end_time).slice(0, 10), -1);   // end_time = fim do dia
            if (d < de || d > ontem) continue;
            (got[d] ||= {})[f] = typeof v.value === "number" ? v.value : 0;
          }
        } catch (_) { /* métrica indisponível nesta versão da API: ignorada */ }
      }
      for (let d = de; d <= ontem; d = addDay(d, 1)) { const o = dia(fb, d); const g = got[d] || {}; for (const f of ["vis", "inter", "alc"] as const) if (g[f] != null) o[f] = g[f]; o.novos = 0; }
      try {
        const j = await gget(`/${page.id}/published_posts`, { fields: "created_time", since: epoch(de), until: epoch(addDay(ontem, 1)), limit: 100 }, token);
        for (const p of j.data || []) { const d = dayOf(new Date(p.created_time)); if (d >= de && d <= ontem) addTo(dia(fb, d), "novos", 1); }
      } catch (_) { /* sem permissão para publicações */ }
      fb.ate = ontem;
    }
    fb.erro = null; fb.ok_at = new Date().toISOString();
  } catch (e) { fb.erro = String((e as Error).message); }

  /* Instagram (conta profissional associada à página) */
  const a = page.instagram_business_account;
  if (!a) { ig.ligado = false; ig.erro = "O Instagram não está associado a esta página do Facebook (ou não é conta profissional)."; return; }
  ig.ligado = true;
  try {
    ig.conta = "@" + a.username;
    dia(ig, hoje).seg = a.followers_count;
    const de = ig.ate ? addDay(ig.ate, 1) : addDay(ontem, -29);
    if (de <= ontem) {
      const dias: string[] = []; for (let d = de; d <= ontem; d = addDay(d, 1)) dias.push(d);
      const one = async (d: string) => {
        const o = dia(ig, d); o.novos = 0;
        const p = { period: "day", metric_type: "total_value", since: epoch(d), until: epoch(d) + 86400 };
        const put = (j: any) => { for (const m of j.data || []) { const v = m.total_value?.value; if (typeof v !== "number") continue; if (m.name === "views") o.vis = v; else if (m.name === "total_interactions") o.inter = v; else if (m.name === "reach") o.alc = v; } };
        try { put(await gget(`/${a.id}/insights`, { ...p, metric: "views,reach,total_interactions" }, token)); }
        catch (_) { for (const m of ["views", "reach", "total_interactions"]) { try { put(await gget(`/${a.id}/insights`, { ...p, metric: m }, token)); } catch (_) { /* ignorada */ } } }
      };
      for (let i = 0; i < dias.length; i += 6) await Promise.all(dias.slice(i, i + 6).map(one));
      try {
        const j = await gget(`/${a.id}/media`, { fields: "timestamp", limit: 100 }, token);
        for (const m of j.data || []) { const d = dayOf(new Date(m.timestamp)); if (d >= de && d <= ontem) addTo(dia(ig, d), "novos", 1); }
      } catch (_) { /* ignorado */ }
      ig.ate = ontem;
    }
    ig.erro = null; ig.ok_at = new Date().toISOString();
  } catch (e) { ig.erro = String((e as Error).message); }
}

/* ---------- valores acumulados (YouTube, TikTok): a diferença desde a última recolha conta para o dia ---------- */
function acumula(r: Rede, d: string, cum: Record<string, number>, map: Record<string, keyof Dia>) {
  const prev = r.cum || {};
  const o = dia(r, d);
  for (const [k, f] of Object.entries(map)) {
    if (cum[k] == null || prev[k] == null) continue;
    addTo(o, f, Math.max(0, cum[k] - prev[k]));
  }
  r.cum = cum;
}

/* ---------- YouTube ---------- */
async function youtube(E: Estado, hoje: string, chave: string) {
  const r = rede(E, "youtube"), key = env("YT_API_KEY"), canal = env("YT_CANAL");
  if (!key || !canal) { r.ligado = false; return; }
  r.ligado = true;
  try {
    const u = new URL("https://www.googleapis.com/youtube/v3/channels");
    u.searchParams.set("part", "statistics,snippet");
    if (/^UC[\w-]{20,}$/.test(canal)) u.searchParams.set("id", canal); else u.searchParams.set("forHandle", canal.startsWith("@") ? canal : "@" + canal);
    u.searchParams.set("key", key);
    const j = await (await fetch(u)).json();
    if (j.error) throw new Error(j.error.message || "Erro YouTube");
    const c = j.items?.[0];
    if (!c) throw new Error("Canal não encontrado: " + canal);
    const s = c.statistics || {};
    r.conta = c.snippet?.customUrl || c.snippet?.title;
    if (!s.hiddenSubscriberCount) dia(r, hoje).seg = +s.subscriberCount;
    acumula(r, chave, { vis: +s.viewCount, novos: +s.videoCount }, { vis: "vis", novos: "novos" });
    r.erro = null; r.ok_at = new Date().toISOString();
  } catch (e) { r.erro = String((e as Error).message); }
}

/* ---------- TikTok ---------- */
async function privGet(id: string) { const { data } = await SB.from("social_privado").select("dados").eq("id", id).maybeSingle(); return data?.dados || null; }
async function privSet(id: string, dados: unknown) { const { error } = await SB.from("social_privado").upsert({ id, dados, updated_at: new Date().toISOString() }); if (error) throw error; }
async function ttToken(form: Record<string, string>) {
  const r = await fetch(TT + "/oauth/token/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(form) });
  const j = await r.json();
  if (!j.access_token) throw new Error(j.error_description || j.error || "Erro TikTok ao obter acesso");
  return { access_token: j.access_token, refresh_token: j.refresh_token, open_id: j.open_id, scope: j.scope, exp: Date.now() + (j.expires_in || 86400) * 1000, rexp: Date.now() + (j.refresh_expires_in || 31536000) * 1000 };
}
async function tiktok(E: Estado, hoje: string, chave: string) {
  const r = rede(E, "tiktok"), ck = env("TIKTOK_CLIENT_KEY"), cs = env("TIKTOK_CLIENT_SECRET");
  if (!ck || !cs) { r.ligado = false; return; }
  let t = await privGet("tiktok");
  if (!t) { r.ligado = false; r.erro = null; return; }
  r.ligado = true;
  try {
    if (Date.now() > t.exp - 3600e3) { t = await ttToken({ client_key: ck, client_secret: cs, grant_type: "refresh_token", refresh_token: t.refresh_token }); await privSet("tiktok", t); }
    const H = { Authorization: "Bearer " + t.access_token };
    const u = await (await fetch(TT + "/user/info/?fields=display_name,username,follower_count,likes_count,video_count", { headers: H })).json();
    if (u.error && u.error.code !== "ok") throw new Error(u.error.message || "Erro TikTok");
    const us = u.data?.user || {};
    r.conta = us.username ? "@" + us.username : us.display_name;
    if (us.follower_count != null) dia(r, hoje).seg = us.follower_count;
    let views: number | null = 0, cursor: number | undefined, n = 0;
    const novosPorDia: Record<string, number> = {};
    try {
      do {
        const v = await (await fetch(TT + "/video/list/?fields=id,view_count,create_time", { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 }) })).json();
        if (v.error && v.error.code !== "ok") throw new Error(v.error.message);
        for (const x of v.data?.videos || []) { views += x.view_count || 0; const d = dayOf(new Date(x.create_time * 1000)); novosPorDia[d] = (novosPorDia[d] || 0) + 1; }
        cursor = v.data?.has_more ? v.data.cursor : undefined;
      } while (cursor && ++n < 25);
    } catch (_) { views = null; }
    const cum: Record<string, number> = { inter: us.likes_count };
    if (views != null) cum.vis = views;
    acumula(r, chave, cum, { vis: "vis", inter: "inter" });
    for (const [d, c] of Object.entries(novosPorDia)) if (d >= addDay(hoje, -60) && r.dias[d]) r.dias[d].novos = c;
    r.erro = null; r.ok_at = new Date().toISOString();
  } catch (e) { r.erro = String((e as Error).message); }
}

/* ---------- recolha completa ---------- */
async function sync(esperaMin: number) {   // intervalo mínimo desde a última recolha
  const { data } = await SB.from("docs").select("data").eq("path", DOC).maybeSingle();
  const E: Estado = data?.data && typeof data.data === "object" ? data.data : { redes: {} };
  E.redes ||= {};
  const last = E.sync_at ? Date.parse(E.sync_at) : 0;
  if (Date.now() - last < esperaMin * 60e3) return { ok: true, ignorado: true, sync_at: E.sync_at };
  const now = new Date(), hoje = dayOf(now), ontem = addDay(hoje, -1);
  const chave = +hourFmt.format(now) < 6 ? ontem : hoje;   // a recolha da madrugada fecha o dia anterior
  await Promise.all([meta(E, chave, ontem), youtube(E, chave, chave), tiktok(E, chave, chave)]);
  const corte = addDay(hoje, -800);
  for (const r of Object.values(E.redes)) for (const d of Object.keys(r.dias || {})) if (d < corte) delete r.dias[d];
  E.sync_at = now.toISOString();
  const { error } = await SB.from("docs").upsert({ path: DOC, data: E, updated_at: E.sync_at });
  if (error) throw error;
  return { ok: true, sync_at: E.sync_at, redes: Object.fromEntries(Object.entries(E.redes).map(([k, r]) => [k, { ligado: !!r.ligado, erro: r.erro || null }])) };
}

async function isAdmin(req: Request) {
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt || jwt.split(".").length !== 3) return false;
  const { data } = await SB.auth.getUser(jwt);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return false;
  const { data: a } = await SB.from("admins").select("email");
  return (a || []).some((x: { email: string }) => String(x.email).toLowerCase() === email);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : Object.fromEntries(new URL(req.url).searchParams);
    const acao = body.acao || "sync";

    if (acao === "sync") return json(await sync(body.forcar && await isAdmin(req) ? 2 : 360));

    if (acao === "tiktok_url") {
      if (!(await isAdmin(req))) return json({ erro: "Sem permissão." }, 403);
      const ck = env("TIKTOK_CLIENT_KEY");
      if (!ck || !env("TIKTOK_CLIENT_SECRET")) return json({ erro: "Faltam as chaves TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET nos segredos do Supabase." }, 400);
      const state = crypto.randomUUID().replace(/-/g, "");
      await privSet("tiktok_state", { state, exp: Date.now() + 15 * 60e3 });
      const u = new URL("https://www.tiktok.com/v2/auth/authorize/");
      u.searchParams.set("client_key", ck);
      u.searchParams.set("scope", "user.info.basic,user.info.profile,user.info.stats,video.list");
      u.searchParams.set("response_type", "code");
      u.searchParams.set("redirect_uri", TIKTOK_REDIRECT);
      u.searchParams.set("state", state);
      return json({ url: u.toString() });
    }

    if (acao === "tiktok_callback") {
      const st = await privGet("tiktok_state");
      if (!st || !body.state || st.state !== body.state || Date.now() > st.exp) return json({ erro: "Ligação expirada ou inválida. Volte a tocar em «Ligar TikTok» na app." }, 400);
      await privSet("tiktok_state", { state: null, exp: 0 });
      const t = await ttToken({ client_key: env("TIKTOK_CLIENT_KEY"), client_secret: env("TIKTOK_CLIENT_SECRET"), code: String(body.code || ""), grant_type: "authorization_code", redirect_uri: TIKTOK_REDIRECT });
      await privSet("tiktok", t);
      const r = await sync(0).catch(() => null);
      return json({ ok: true, sync: r });
    }

    return json({ erro: "Ação desconhecida." }, 400);
  } catch (e) {
    return json({ erro: String((e as Error).message || e) }, 500);
  }
});
