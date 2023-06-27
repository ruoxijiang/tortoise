import useServerSentEvents from "../hooks/useServerSideEvents";

let baseURL = '/openai';
if (process.env.NODE_ENV === 'production') {
    baseURL = 'https://tortoise.gtkrab.workers.dev/openai'
}
type Summary = {
    content: string,
    randomness: number,
    password: string
}
type Summaries = {
    content: string[],
    randomness: number,
    password: string
}
type Result = {
    error?: string,
    result?: string,
}
type ChatResponseStream = {
    index: number,
    delta: {
        content?: string
    },
    finish_reason: 'stop'| null
}
type ChatResponses = {
    choices: Array<ChatResponseStream>
}
export const useGenUT = ({onData, onOpen, onClose, onError}:{onData: (data: string) => void,
onOpen: () => void,
    onClose: () => void,
    onError: (event: Error) => void})=> {
    const onMessage = (jsonStr: string) => {
        if(jsonStr=== '[DONE]'){
            onData && onData('');
        } else {
            const d: ChatResponses = JSON.parse(jsonStr);
            if(d.choices[0].delta.content){
                onData && onData(d.choices[0].delta.content)
            }
        }
    };
    return useServerSentEvents({
        baseUrl: `${baseURL}/generateUT`,
        onData: onMessage,
        onClose,
        onError,
        onOpen
    });
};
export const getPartialSummary = async ({content, randomness, password}: Summary): Promise<Result> => {
    try {
        const response = await fetch(`${baseURL}/partialSummary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content, randomness, password}),
        });
        const data: { error?: unknown, result?: string } = await response.json();
        if (response.status !== 200) {
            return {error: data.error as string || `Request failed with status ${response.status}`}
        }
        return {...data, error: undefined}
    } catch (e: unknown) {
        // @ts-ignore
        return {error: e.message}
    }

};

export const groupSummaries = async ({content, randomness, password}: Summaries): Promise<Result> => {
    try {
        const response = await fetch(`${baseURL}/groupSummary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({content, randomness, password}),
        });
        const data: { error?: unknown, result?: string } = await response.json();
        if (response.status !== 200) {
            return {error: data.error as string || `Request failed with status ${response.status}`}
        }
        return {...data, error: undefined}
    } catch (e: unknown) {
        // @ts-ignore
        return {error: e.message}
    }
};