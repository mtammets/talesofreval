import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const siteRoot = path.join(projectRoot, "site");
const frontendRoot = path.join(siteRoot, "frontend");
const backendRoot = path.join(siteRoot, "backend");
const backendEnvPath = path.join(backendRoot, ".env");
const frontendScript = path.join(
  frontendRoot,
  "node_modules",
  "react-scripts",
  "bin",
  "react-scripts.js"
);
const backendScript = path.join(
  siteRoot,
  "node_modules",
  "nodemon",
  "bin",
  "nodemon.js"
);

function getNetworkUrls(port) {
  const urls = [];
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;

    for (const entry of entries) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      urls.push(`http://${entry.address}:${port}/`);
    }
  }

  return [...new Set(urls)];
}

function spawnCommand(command, args, options) {
  return spawn(command, args, {
    stdio: "inherit",
    ...options
  });
}

const frontendPort = Number(process.env.FRONTEND_PORT || 5173);
const backendPort = Number(process.env.BACKEND_PORT || 5020);
const localUrl = `http://localhost:${frontendPort}/`;
const networkUrls = getNetworkUrls(frontendPort);

console.log("");
console.log("Tales Of Reval full-stack dev runner");
console.log(`Arvutis:  ${localUrl}`);
console.log(
  `Telefonis: ${networkUrls[0] || "võrguaadressi ei tuvastatud automaatselt"}`
);

if (networkUrls.length > 1) {
  for (const extraUrl of networkUrls.slice(1)) {
    console.log(`Telefonis (alternatiiv): ${extraUrl}`);
  }
}

console.log(`Frontend port: ${frontendPort}`);
console.log(`Backend port:  ${backendPort}`);
console.log("Content mode:  local static content");
console.log("Email mode:    backend + server SMTP");
console.log("");

if (!fs.existsSync(path.join(siteRoot, "package.json"))) {
  console.error("Puudub site/package.json. Kontrolli, et täisstack rakendus oleks kaustas site/.");
  process.exit(1);
}

if (!fs.existsSync(frontendScript)) {
  console.error("Puudub site/frontend/node_modules/react-scripts. Kontrolli, et frontend sõltuvused oleksid kaasas või paigalda need uuesti.");
  process.exit(1);
}

let backendProcess = null;

if (fs.existsSync(backendEnvPath) || process.env.PORT) {
  backendProcess = spawnCommand(
    "node",
    [backendScript, "server.js"],
    {
      cwd: backendRoot,
      env: {
        ...process.env,
        PORT: String(backendPort)
      }
    }
  );
} else {
  console.warn("Backendit ei käivitatud.");
  console.warn(`Puudub ${path.relative(projectRoot, backendEnvPath)}.`);
  console.warn("Avalik sisu töötab ka ilma backendita, aga e-mailivormid mitte.");
  console.warn("");
}

const frontendProcess = spawnCommand(
  "node",
  [frontendScript, "start"],
  {
    cwd: frontendRoot,
    env: {
      ...process.env,
      HOST: "0.0.0.0",
      PORT: String(frontendPort),
      BROWSER: "none",
      WDS_SOCKET_PORT: String(frontendPort)
    }
  }
);

function shutdown(code = 0) {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGINT");
  }

  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill("SIGINT");
  }

  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

if (backendProcess) {
  backendProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Backend lõpetas veaga (exit ${code}).`);
    }
  });
}

frontendProcess.on("exit", (code) => {
  shutdown(code ?? 0);
});
