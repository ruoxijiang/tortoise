import {Configuration, OpenAIApi} from "openai-edge";
import {getEnvs} from "./envs";
import {CorsHeaders, UnixTimestampInSeconds} from "./utils";

export type Model = {
    id: string,
    created: UnixTimestampInSeconds,
    object: 'model',
    owned_by: string
}
export type ModelList = {
    object: 'list',
    data: Model[],
}
export const listModels = async (req: Request) => {
    const headers = CorsHeaders({origin: req.headers.get("Origin") || ""});
    const api = initAPI();
    const resp = await api.listModels();
    return new Response(resp.body, {headers, status: 200})
};
type ChatFormat = {
    role: "system" | "assistant" | 'user',
    content: string
}
type CreateChatCompletionRequest = {
    model: string,
    messages: ChatFormat[],
    temperature?: number,
    top_p?: number,
    n?: number,
    stop?: string,
    max_tokens?: number,
}
const base = "https://api.openai.com/v1";
const  OpenAI  = (key: string) =>{
    const configuration = new Configuration({
        apiKey: key,
    });
    return new OpenAIApi(configuration);
};

const initAPI = () => {
    return OpenAI(getEnvs().OPENAI_API_KEY || "")
};

export const callChat = async function(data: CreateChatCompletionRequest) {
    const openai = initAPI();
    let status = 200;
    let body = '';
    const model = data.model || 'gpt-3.5.turbo';
    const temperature = data.temperature || 0.2;
        try {
            const completion = await openai.createChatCompletion({
                model,
                messages: data.messages,
                temperature,
                stream: true
            });
            return {body: completion.body, status, headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/event-stream;charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    "X-Accel-Buffering": "no",
                }}
        } catch (error: any) {
            if (error.response) {
                console.error(error.response.status, error.response.data);
                status = error.response.status;
                body = JSON.stringify(error.response.data);
            } else {
                console.error(`Error with OpenAI API request: ${error.message}`);
                status = 500;
                body = JSON.stringify({
                    error: {
                        message: 'An error occurred during your request.',
                    }
                });
            }
        }
    return {body, status};
};


export default OpenAI