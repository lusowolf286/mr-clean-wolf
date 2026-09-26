/* Mr Clean Wolf — funcionamento sem rede (cliente) */
const V = "cw-cliente-v3";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "../config.js",
  "../icons/wolf.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js",
  "../icons/cliente-192.png",
  "../icons/cliente-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("cw-cliente") && k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname.endsWith("supabase.co")) return;              // dados: sempre pela rede
  const cacheable = u.origin === location.origin || /(jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if (!cacheable) return;
  e.respondWith(
    fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./index.html") : undefined)))
  );
});
