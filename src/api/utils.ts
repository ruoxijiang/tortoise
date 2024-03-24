export type ChatRoles = "system" | "assistant" | "user"

export type ChatFormat = {
    role: ChatRoles,
    content: string
}
export type ChatRequest = {
    model: string,
    messages: ChatFormat[],
    temperature?: number,
    top_p?: number,
    n?: number,
    max_tokens?: number,
}
export type ChatParam = {
    temperature?: number,
    top_p?: number,
    n?: number,
    max_tokens?: number,
}