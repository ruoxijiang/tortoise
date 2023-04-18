import OpenAI from "./lib/openai";
import {getEnvs} from "./lib/envs";


export const vacationGenerate = async function (req, env) {
  const openai = new OpenAI(getEnvs().OPENAI_API_KEY);
  let status = 200;
  let body = '';
  const headers = {
    "Content-Type": "application/json",
    'Access-Control-Allow-Origin': req.headers.get("Origin"),
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
  let data =await req.text();
  console.log(data);
  data = JSON.parse(data);
  const password = data.password || '';
  const passKey = await env.OPENAI_KV.get('access_key', {type: "text"});
  console.log(`pass ${passKey}`);
  if(password !== "your wish is my command"){
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
      messages: generateMessages({destination, vacationLen}),
      temperature,
    });
    console.log(`Usage ${JSON.stringify(completion)}`);
    console.log(`Usage ${JSON.stringify(completion.choices[0].finish_reason)}`);
    console.log(`Usage ${JSON.stringify(completion.choices.length)}`);
    body = JSON.stringify({ result: completion.choices[0].message.content });
  } catch(error) {
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

function generateMessages(data) {
  const system = {role: "system", content: "you are a helpful and knowledgeable travel agent that help people plan their vacation"};
  const user = {role: "user", content: `I'm planning a ${data.vacationLen} day vacation to ${data.destination}, with my wife and her grandmother, who cannot walk for extended period of times. We want the vacation to be relaxed, and mostly enjoying local food and culture. Generate a itinerary for us that includes places to visit and restaurants to eat at. In HTML format, with the content wrapped in <div> tag.`};
  return [system, user]
}
