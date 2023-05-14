/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {groupGenerateSummary, partialGenerateSummary, summaryGenerate, vacationGenerate} from "./generate";
import {initEnvs} from "./lib/envs";

export interface Env {
	OPENAI_API_KEY: string,
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	SENDGRID: KVNamespace;
	OPENAI_KV: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}
const keyTTLSeconds = 300;
async function optionRequest(request: Request) {
	return new Response(
		'',
		{
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': request.headers.get("Origin") as string,
				'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
				'Access-Control-Allow-Headers': '*',
			}
		}
	);
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		initEnvs(env);
		if(request.method.toLocaleUpperCase() === 'OPTIONS'){
			return await optionRequest(request)
		} else if (request.method.toLocaleUpperCase() === 'POST' && request.url.toString().includes('/sendgrid')){
			const contentType = request.headers.get('content-type');
			if((contentType || "").includes('application/json')){
				const body = await request.text();
				if(body){
					await env.SENDGRID.put('sendgrid_events', body, {expirationTtl: keyTTLSeconds});
					return new Response(body, {
						headers: {
							"content-type": "application/json;charset=UTF-8",
						},
					});
				}
			}
		} else if(request.url.toString().includes("/openai/summary")) {
			return await summaryGenerate(request, env)
		} else if(request.url.toString().includes("/openai/partialSummary")) {
			return await partialGenerateSummary(request, env)
		} else if(request.url.toString().includes("/openai/groupSummary")) {
			return await groupGenerateSummary(request, env)
		} else if(request.url.toString().includes("/openai")) {
			return await vacationGenerate(request, env)
		}
		return new Response(request.headers.get('content-type'), {
			status: 400,
		})
	},
};
