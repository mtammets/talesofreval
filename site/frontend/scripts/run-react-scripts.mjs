import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, "..");
const cleanScript = path.join(scriptDir, "clean-source-map-warnings.mjs");
const reactScriptsPath = path.join(
  frontendRoot,
  "node_modules",
  "react-scripts",
  "bin",
  "react-scripts.js"
);

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("Missing react-scripts command.");
  process.exit(1);
}

const cleanResult = spawnSync(process.execPath, [cleanScript], {
  cwd: frontendRoot,
  env: process.env,
  stdio: "inherit"
});

if (cleanResult.status !== 0) {
  process.exit(cleanResult.status ?? 1);
}

const child = spawn(process.execPath, [reactScriptsPath, command, ...args], {
  cwd: frontendRoot,
  env: process.env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
