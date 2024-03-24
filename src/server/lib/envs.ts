export interface Env {
    OPENAI_API_KEY?: string,
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    SENDGRID?: KVNamespace;
    OPENAI_KV?: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    // MY_BUCKET: R2Bucket;
}
let envs: Env = {};
export const initEnvs = (env: Env) => {
    envs = env
};
export const getEnvs = () => {
    return envs;
};