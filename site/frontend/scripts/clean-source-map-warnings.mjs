import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, "..");

const cleanupTargets = [
  {
    filePath: path.join(frontendRoot, "node_modules", "@remix-run", "router", "dist", "router.js"),
    sourceMapCommentPattern: /\n\/\/# sourceMappingURL=router\.js\.map\s*$/
  },
  {
    filePath: path.join(frontendRoot, "node_modules", "react-toastify", "dist", "ReactToastify.css"),
    sourceMapCommentPattern: /\n\/\*# sourceMappingURL=ReactToastify\.css\.map \*\/\s*$/
  }
];

async function stripSourceMapComment(filePath, sourceMapCommentPattern) {
  let contents;

  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }

    throw error;
  }

  if (!sourceMapCommentPattern.test(contents)) {
    return;
  }

  await fs.writeFile(filePath, contents.replace(sourceMapCommentPattern, "\n"), "utf8");
}

async function main() {
  for (const target of cleanupTargets) {
    await stripSourceMapComment(target.filePath, target.sourceMapCommentPattern);
  }
}

main().catch((error) => {
  console.error("Failed to clean dependency source map warnings.");
  console.error(error);
  process.exit(1);
});
