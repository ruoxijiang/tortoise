import {Configuration, OpenAIApi} from "openai-edge";

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
}

export default OpenAI