// Copia a app de gestão para www/ (conteúdo embutido na app iOS), com as bibliotecas locais.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
const R = "..", W = "www";
rmSync(W, { recursive: true, force: true });
mkdirSync(W + "/vendor", { recursive: true });
for (const p of ["config.js", "shared", "icons", "gestao"]) cpSync(`${R}/${p}`, `${W}/${p}`, { recursive: true });
rmSync(`${W}/gestao/sw.js`, { force: true });
cpSync("node_modules/@supabase/supabase-js/dist/umd/supabase.js", `${W}/vendor/supabase.js`);
cpSync("node_modules/jspdf/dist/jspdf.umd.min.js", `${W}/vendor/jspdf.umd.min.js`);
let h = readFileSync(`${W}/gestao/index.html`, "utf8");
h = h.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[^"]+\/dist\/umd\/supabase\.js/, "../vendor/supabase.js")
     .replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/[^"]+\/jspdf\.umd\.min\.js/, "../vendor/jspdf.umd.min.js")
     .replace(/<script>if \("serviceWorker"[^<]*<\/script>/, "")
     .replace(/<link rel="manifest"[^>]*>/, "");
if (/cdn\.jsdelivr|cdnjs\.cloudflare/.test(h)) throw new Error("Ficou uma biblioteca externa por substituir");
writeFileSync(`${W}/gestao/index.html`, h);
writeFileSync(`${W}/index.html`, '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=gestao/index.html"><body style="background:#121212">');
console.log("www pronto");
