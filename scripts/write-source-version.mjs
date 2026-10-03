import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
mkdirSync("app/generated", { recursive: true });
writeFileSync("app/generated/source-version.json", JSON.stringify({ repository: "dhays4sports/smartdevices", sha }) + "\n");
