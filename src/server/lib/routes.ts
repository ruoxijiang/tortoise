import {HTTPMethods} from "./utils";
import {Env} from "./envs";

type Handler =(req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
export type RouteParam = {
    path: string,
    children?: RouteParam[],
    method?: HTTPMethods,
    handler?: Handler
}

export const ParseRoute = (root: RouteParam[], req: Request, env: Env, ctx: ExecutionContext): Handler => {
    if(Array.isArray(root) && root.length > 0){
        for(let i=0; i<root.length; i++){
            const handler = helper('', root[i], req, env, ctx);
            if(handler){
                return handler
            }
        }
    }
    return badRequest
};
const badRequest = async () => {
    return new Response("Bad Request", {
        status: 400,
        statusText: "Bad Request"
    })
};
const helper = (basePath: string, root: RouteParam, req: Request, env: Env, ctx: ExecutionContext): Handler | undefined => {
    const url = new URL(req.url).pathname;
    const method = req.method.toLocaleUpperCase();
    const targetPath = `${basePath}/${root.path}`;
    console.log(`url: ${url}, targetPath: ${targetPath}, basePath: ${basePath}`);
    if(url === targetPath){
        if(!root.method || root.method === method){
            return root.handler || badRequest
        }
    } else if (url.startsWith(targetPath)){
        console.log('looking at children');
        if(Array.isArray(root.children) && root.children.length > 0){
            for(let i=0; i<root.children.length; i++){
                const handler = helper(`${basePath}/${root.path}`, root.children[i], req, env, ctx);
                if(handler){
                    return handler
                }
            }
        }
    }
    return undefined
};