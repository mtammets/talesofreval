import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const frontendRoot = path.join(projectRoot, "site", "frontend");
const frontendBuildScript = path.join(
  frontendRoot,
  "node_modules",
  "react-scripts",
  "bin",
  "react-scripts.js"
);

const buildProcess = spawn(
  "node",
  [frontendBuildScript, "build"],
  {
    cwd: frontendRoot,
    stdio: "inherit",
    env: process.env
  }
);

buildProcess.on("exit", (code) => {
  process.exit(code ?? 0);
});
