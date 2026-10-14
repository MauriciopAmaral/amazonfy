// Monta a pasta deploy/public_html com tudo que vai para a Hostinger:
//   - o site (conteúdo de dist/)
//   - a API PHP (api/), SEM o config.php com a senha do banco
// Depois é só compactar o CONTEÚDO de deploy/public_html e enviar pelo
// Gerenciador de Arquivos do hPanel (veja o README).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dist = path.join(root, "dist");
const out = path.join(root, "deploy", "public_html");

if (!fs.existsSync(dist)) {
  console.error("Pasta dist/ não encontrada. Rode: npm run build");
  process.exit(1);
}

fs.rmSync(path.join(root, "deploy"), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

fs.cpSync(dist, out, { recursive: true });
fs.cpSync(path.join(root, "api"), path.join(out, "api"), {
  recursive: true,
  filter: (src) => path.basename(src) !== "config.php",
});

console.log("\n✔ Pacote pronto em deploy/public_html");
console.log("  1. Envie o conteúdo dessa pasta para public_html na Hostinger.");
console.log("  2. No servidor, copie api/config.example.php para api/config.php e preencha os dados do banco.\n");
