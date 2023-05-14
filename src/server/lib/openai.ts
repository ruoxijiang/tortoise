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
class OpenAI {
    apiKey: string;
    headers: {[name: string]: string};
    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
        }
    }
    async createChatCompletion(data: CreateChatCompletionRequest) {
        if(!isFinite(data.temperature as number)){
            data.temperature = 1
        }
        if(!isFinite(data.n as number)){
            data.n = 1
        }
        if(!isFinite(data.top_p as number)){
            data.top_p = 1
        }
        const ret = await fetch(`${base}/chat/completions`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        return await ret.json()
    }
}

export default OpenAI