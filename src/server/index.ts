/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {
    generateChat,
    generateUT,
    groupGenerateSummary,
    partialGenerateSummary,
    summaryGenerate,
    vacationGenerate
} from "./generate";
import {Env, initEnvs} from "./lib/envs";
import {ParseRoute, RouteParam} from "./lib/routes";
import {listModels} from "./lib/openai";

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

const Root: RouteParam[] = [
    {
        path: '',
        method: "OPTIONS",
        handler: optionRequest,
        children: []
    },
    {
        path: 'openai',
        children: [
            {
                path: 'listModels',
                method: "GET",
                handler: listModels
            },
            {
                path: 'summary',
                handler: summaryGenerate,
            },
            {
                path: 'partialSummary',
                handler: partialGenerateSummary
            },
            {
                path: 'groupSummary',
                handler: groupGenerateSummary
            },
            {
                path: 'vacation',
                handler: vacationGenerate
            },
            {
                path: 'generateUT',
                handler: generateUT,
            },
            {
                path: 'generateChat',
                handler: generateChat
            },
        ]
    }
];

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        initEnvs(env);
        const handler = ParseRoute(Root, request, env, ctx);
        return await handler(request, env, ctx)
    },
};
