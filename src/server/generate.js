import OpenAI from "./lib/openai";
import {getEnvs} from "./lib/envs";

const authValidate  = async function(req, env) {
    let status = 200;
    let body = '';
    const headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': req.headers.get("Origin"),
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };
    let data = await req.text();
    console.log(data);
    data = JSON.parse(data);
    const password = data.password || '';
    const passKey = await env.OPENAI_KV.get('access_key');
    console.log(`pass ${passKey}`);
    if (password !== passKey) {
        status = 401;
        body = JSON.stringify({
            error: {
                message: 'Access denied.',
            }
        });
        return {body, status, headers};
    }
    return {status, body, data, headers}
};

export const generateUT = async function (req, env) {
    const openai = OpenAI(getEnvs().OPENAI_API_KEY);
    let status = 200;
    let body = '';
    const headers = {
        'Access-Control-Allow-Origin': req.headers.get("Origin"),
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };
    let data = await req.text();
    console.log(`text data ${data}`);
    data = JSON.parse(data);
    if (typeof data.code !== 'string' || data.code.length === 0){
        status = 404;
        body = JSON.stringify({error: {message: "Code cannot be generated"}})
    }
    if(status === 200) {
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: 'system', content: `You are an experienced Golang programmer that will compact and effective unit test code.`},
                    {role: 'user', content: `Generate test case code for the following Golang code:\n ${data.code}.`}],
                temperature: 0.2,
                stream: true
            });
            return new Response(completion.body, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/event-stream;charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    "X-Accel-Buffering": "no",
                },
            })
        } catch (error) {
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
    }
    return new Response(body, {headers, status});
};

export const summaryGenerate = async function (req, env) {
    const openai = OpenAI(getEnvs().OPENAI_API_KEY);
    let status = 200;
    let body = '';
    const headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': req.headers.get("Origin"),
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };
    let data = await req.text();
    console.log(data);
    data = JSON.parse(data);
    const password = data.password || '';
    const passKey = await env.OPENAI_KV.get('access_key', {type: "text"});
    console.log(`pass ${passKey}`);
    if (password !== passKey) {
        status = 401;
        body = JSON.stringify({
            error: {
                message: 'Access denied.',
            }
        });
        return new Response(body, {status, headers});
    }
    const temperature = data.randomness || 0.6;

    const splits = splitContent(data.content);
    console.log(`Number of splits: ${splits.length}`);

    try {
        const summaries = await completeGroupChatCompletions(openai, splits, temperature);
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: groupSummaryMessages(summaries),
            temperature,
        });
        console.log(`Usage ${JSON.stringify(completion)}`);
        console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
        console.log(`Usage ${JSON.stringify(completion.choices.length)}`);
        body = JSON.stringify({result: completion.choices[0].message.content});
    } catch (error) {
        // Consider adjusting the error handling logic for your use case
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
    return new Response(body, {headers, status});
};

export const vacationGenerate = async function (req, env) {
    const openai = OpenAI(getEnvs().OPENAI_API_KEY);
    let status = 200;
    let body = '';
    const headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': req.headers.get("Origin"),
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };
    let data = await req.text();
    console.log(data);
    data = JSON.parse(data);
    const password = data.password || '';
    const passKey = await env.OPENAI_KV.get('access_key', {type: "text"});
    console.log(`pass ${passKey}`);
    if (password !== passKey) {
        status = 401;
        body = JSON.stringify({
            error: {
                message: 'Access denied.',
            }
        });
        return new Response(body, {status, headers});
    }
    const destination = data.destination || '';
    const vacationLen = data.vacationLen || 1;
    if (destination.trim().length === 0) {
        status = 400;
        body = JSON.stringify({
            error: {
                message: "Please enter a valid destination",
            }
        });
        return new Response(body, {status, headers});
    }
    if (!Number.isInteger(vacationLen)) {
        status = 400;
        body = JSON.stringify({
            error: {
                message: "Please enter a valid integer",
            }
        });
        return new Response(body, {status, headers});
    }
    const temperature = data.randomness || 0.6;
    console.log('Sending requests to openAI');
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: generateVacationMessages({destination, vacationLen}),
            temperature,
        });
        console.log(`Usage ${JSON.stringify(completion)}`);
        console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
        console.log(`Usage ${JSON.stringify(completion.choices.length)}`);
        body = JSON.stringify({result: completion.choices[0].message.content});
    } catch (error) {
        // Consider adjusting the error handling logic for your use case
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
    return new Response(body, {headers, status});
};

export const partialGenerateSummary = async function (req, env) {
    let {status, body, data, headers} = await authValidate(req, env);
    if(!data){
        return new Response(body, {headers, status})
    }
    const openai = OpenAI(env.OPENAI_API_KEY);
    const temperature = data.randomness || 0.6;
    const content = data.content;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: generateSummaryMessages(content),
            temperature,
        });
        console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
        body = JSON.stringify({result: completion.choices[0].message.content});
    }catch (error) {
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
    return new Response(body, {headers, status});
};
export const groupGenerateSummary = async function(req, env) {
    let {status, body, data, headers} = await authValidate(req, env);
    if(!data){
        return new Response(body, {headers, status})
    }
    const openai = OpenAI(env.OPENAI_API_KEY);
    const temperature = data.randomness || 0.6;
    const summaries = data.content;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: groupSummaryMessages(summaries),
            temperature,
        });
        console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
        body = JSON.stringify({result: completion.choices[0].message.content});
    }catch (error) {
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
    return new Response(body, {headers, status});
};

async function completeGroupChatCompletions(client, contents, temperature) {
    const ret = [];
    return new Promise((resolve) => {
        contents.forEach(async (content) => {
            const completion = await client.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: generateSummaryMessages(content),
                temperature,
            });
            console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
            ret.push(completion.choices[0].message.content)
            if (ret.length === contents.length) {
                resolve(ret)
            }
        });
    })

}

function generateSummaryMessages(content) {
    const system = {role: "system", content: "你是一个资深的行业分析员，会根据上市公司交流纪要，并会提出准确实用的投资建议。你的回答是简短的"};
    const user = {role: "user", content: `以下是交流纪要，请总结并提出投资建议\n${content}`};
    return [system, user]
}

function groupSummaryMessages(summaries) {
    const system = {role: "system", content: "你是一个资深的行业分析员，会根据上市公司交流纪要，并会提出准确实用的投资建议。你的回答是简短的"};
    const user = {role: "user", content: `请将以下内容整合成一个完整的总结\n${summaries.join('\n')}`};
    return [system, user]
}

const contentLen = 1000;

function splitContent(content) {
    const paragraphs = content.split('\n');
    const sections = [];
    let tmp = "";
    paragraphs.forEach((c, i) => {
        if (tmp.length + c.length <= contentLen) {
            tmp = `${tmp}${c}`
        } else {
            sections.push(tmp);
            tmp = c
        }
        if (i === paragraphs.length - 1) {
            sections.push(tmp)
        }
    });
    return sections
}

function generateVacationMessages(data) {
    const system = {
        role: "system",
        content: "you are a helpful and knowledgeable travel agent that help people plan their vacation"
    };
    const user = {
        role: "user",
        content: `I'm planning a ${data.vacationLen} day vacation to ${data.destination}, with my wife and her grandmother, who cannot walk for extended period of times. We want the vacation to be relaxed, and mostly enjoying local food and culture. Generate a itinerary for us that includes places to visit and restaurants to eat at. In HTML format, with the content wrapped in <div> tag.`
    };
    return [system, user]
}
