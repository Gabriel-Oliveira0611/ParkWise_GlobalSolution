import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log(
  "Teste de escrita real: cria registros QA próprios, relê os dados e os desativa no finally. O histórico técnico permanece no Oracle.",
);
const resultado = spawnSync(
  process.execPath,
  [
    path.join(root, "node_modules/vitest/vitest.mjs"),
    "run",
    "src/test/live.api.test.ts",
    "--reporter=verbose",
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PARKWISE_TESTE_ESCRITA: "1" },
  },
);
if (resultado.error) console.error(resultado.error.message);
process.exitCode = resultado.status ?? 1;
