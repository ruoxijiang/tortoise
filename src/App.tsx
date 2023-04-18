import React, { useState } from "react";
import "./index.css";

export default function App() {
  const [waiting, setWaiting] = useState(false);
  const [destination, setDestination] = useState("");
  const [vacationLen, setVacationLen] = useState(5);
  const [randomness, setRandomness] = useState(0.6);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState('');
  let baseURL = '';
  if(process.env.NODE_ENV ==='production'){
    baseURL = 'https://tortoise.gtkrab.workers.dev'
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setPassword('');
      const response = await fetch(`${baseURL}/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destination, vacationLen, randomness, password }),
      });
      const data:{error?: unknown, result?: string} = await response.json();
      setWaiting(false);
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result as string);
      setDestination("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
    }
  }

  return (
    <div>
      <main className="main">
        <img src="/dog.png" className={"icon"} />
        <h3>Vacation Plan</h3>
        <form onSubmit={(e)=> {
          if(waiting){
            return
          }
          setWaiting(true);
          onSubmit(e)
        }}>
          <input
            type="text"
            name="destination"
            placeholder="Enter a destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <label htmlFor="days">Enter length of vacation</label>
          <input
              id="days"
              type="number"
              name="days"
              placeholder="Enter length of vacation"
              value={vacationLen}
              onChange={(e) => setVacationLen(parseInt(e.target.value))}
          />
          <label htmlFor="randomness">Randomness from 0 - 1</label>
          <input
              type="number"
              id="randomness"
              name="randomness"
              placeholder="Randomness from 0 - 1"
              value={randomness}
              onChange={(e) => setRandomness(Number.parseFloat(e.target.value))}
          />
          <label htmlFor="passKey">Enter password</label>
          <input
              type="text"
              id="passKey"
              name="passKey"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          />
          <input type="submit" value={waiting ? "Generating itinerary" : "Generate itinerary"} />
        </form>
        <div className={"result"}>
          <div dangerouslySetInnerHTML={{ __html: result }} />
        </div>
      </main>
    </div>
  );
}
