export type HTTPMethods = "GET" | "HEAD" | "POST" | "OPTIONS" | "PUT" | "DELETE" | "PATCH"

export const CorsHeaders = (options: {methods?: HTTPMethods[], origin?: string} = {}) => {
    const headerMethods = (Array.isArray(options.methods) ? options.methods : ["GET", "HEAD", "POST", "OPTIONS"]).join(", ");
    const origin = options.origin || "*";
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': headerMethods,
        'Access-Control-Allow-Headers': '*',
    }
};



export type UnixTimestampInSeconds = number