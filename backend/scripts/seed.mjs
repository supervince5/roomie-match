// Fills the dev database with sample roommates so Discover has people to show.
// Each profile goes through the real createProfile Lambda, so it's validated like real data.
// These are fake users (ids start with "seed-"); they can't log in.
//
// Run from backend/:   node scripts/seed.mjs
// Re-running is safe: profiles that already exist come back 409 and are skipped.

import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FUNCTION_NAME = "roomie-match-backend-dev-createProfile";
const REGION = "us-east-1";

const profiles = JSON.parse(readFileSync(new URL("./seedProfiles.json", import.meta.url)));
const outFile = join(tmpdir(), "seed-out.json");

for (const { id, ...profile } of profiles) {
    const event = {
        requestContext: { authorizer: { jwt: { claims: { sub: id } } } },
        body: JSON.stringify(profile)
    };
    execFileSync("aws", [
        "lambda", "invoke",
        "--region", REGION,
        "--function-name", FUNCTION_NAME,
        "--cli-binary-format", "raw-in-base64-out",
        "--payload", JSON.stringify(event),
        outFile
    ], { stdio: "ignore" });

    const result = JSON.parse(readFileSync(outFile, "utf8"));
    console.log(`${String(result.statusCode).padEnd(4)} ${id}  ${result.statusCode === 201 ? "" : result.body}`);
}
unlinkSync(outFile);
