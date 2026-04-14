import os from "node:os";
import { createServer } from "vite";

function getNetworkCandidates(port) {
  const urls = [];
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    if (!entries) {
      continue;
    }

    for (const entry of entries) {
      if (entry.family !== "IPv4" || entry.internal) {
        continue;
      }

      urls.push(`http://${entry.address}:${port}/`);
    }
  }

  return [...new Set(urls)];
}

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 5173);

const server = await createServer({
  clearScreen: false,
  server: {
    host,
    port
  }
});

await server.listen();

const resolved = server.resolvedUrls ?? { local: [], network: [] };
const localUrl = resolved.local?.[0] || `http://localhost:${server.config.server.port}/`;
const networkUrls = resolved.network?.length
  ? resolved.network
  : getNetworkCandidates(server.config.server.port);

console.log("");
console.log("Arendusserver töötab.");
console.log(`Arvutis:  ${localUrl}`);

if (networkUrls.length > 0) {
  console.log(`Telefonis: ${networkUrls[0]}`);
} else {
  console.log("Telefonis: võrguaadressi ei tuvastatud automaatselt");
}

if (networkUrls.length > 1) {
  for (const extraUrl of networkUrls.slice(1)) {
    console.log(`Telefonis (alternatiiv): ${extraUrl}`);
  }
}

console.log("");

await new Promise(() => {});
