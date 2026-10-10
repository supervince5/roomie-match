// Reads a setting from serverless.yml's environment: block.
// If it's missing, that's our deployment's fault, so we throw (fail fast)
// and let the safety net log it and return a 500.
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
