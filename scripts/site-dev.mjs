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
  "scripts",
  "run-react-scripts.mjs"
);
const backendScript = path.join(
  siteRoot,
  "node_modules",
  "nodemon",
  "bin",
  "nodemon.js"
);

function getNetworkUrls(port) {
  const interfaces = os.networkInterfaces();
  const preferredInterfaceNames = ["en0", "en1", "Wi-Fi", "Ethernet"];
  const collected = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    if (!entries) continue;

    for (const entry of entries) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      collected.push({
        interfaceName: name,
        address: entry.address,
        url: `http://${entry.address}:${port}/`
      });
    }
  }

  const priorityFor = (interfaceName) => {
    const preferredIndex = preferredInterfaceNames.indexOf(interfaceName);
    if (preferredIndex >= 0) {
      return preferredIndex;
    }

    if (/^en\d+$/.test(interfaceName)) {
      return preferredInterfaceNames.length + Number(interfaceName.slice(2));
    }

    return preferredInterfaceNames.length + 100;
  };

  return collected
    .sort((left, right) => {
      const priorityDiff =
        priorityFor(left.interfaceName) - priorityFor(right.interfaceName);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return left.interfaceName.localeCompare(right.interfaceName);
    })
    .filter((entry, index, list) => list.findIndex((item) => item.url === entry.url) === index);
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
const publicSiteUrl =
  process.env.REACT_APP_PUBLIC_SITE_URL || networkUrls[0]?.url || localUrl;

console.log("");
console.log("Tales Of Reval full-stack dev runner");
console.log(`Arvutis:  ${localUrl}`);
console.log(
  `Telefonis: ${networkUrls[0]?.url || "võrguaadressi ei tuvastatud automaatselt"}`
);

if (networkUrls.length > 1) {
  for (const extraUrl of networkUrls.slice(1)) {
    console.log(
      `Telefonis (alternatiiv, ${extraUrl.interfaceName}): ${extraUrl.url}`
    );
  }
}

console.log(`Frontend port: ${frontendPort}`);
console.log(`Backend port:  ${backendPort}`);
console.log(`QR base URL:   ${publicSiteUrl}`);
console.log("Content mode:  local static content");
console.log("Email mode:    backend + server SMTP");
console.log("");

if (!fs.existsSync(path.join(siteRoot, "package.json"))) {
  console.error("Puudub site/package.json. Kontrolli, et täisstack rakendus oleks kaustas site/.");
  process.exit(1);
}

if (!fs.existsSync(frontendScript)) {
  console.error("Puudub site/frontend/scripts/run-react-scripts.mjs. Kontrolli, et frontend setup oleks olemas.");
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
      WDS_SOCKET_PORT: String(frontendPort),
      REACT_APP_PUBLIC_SITE_URL: publicSiteUrl
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
