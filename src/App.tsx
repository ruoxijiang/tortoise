import React, {useState} from "react";
import {getPartialSummary, groupSummaries} from "./api";
import "./index.css";

const contentLen = 1000;

export default function App() {
    const [waiting, setWaiting] = useState(false);
    const [content, setContent] = useState("");
    const [randomness, setRandomness] = useState(0.6);
    const [password, setPassword] = useState("");
    const [result, setResult] = useState('');

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        function splitContent(content: string) {
            const paragraphs = content.split(/\n|\r/);
            const sections: string[] = [];
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

        event.preventDefault();
        const ret: Array<{content: string, index: number}> = [];
        try {
            const userPass = password;
            const userRandomness = randomness;
            setPassword('');
            const splits = splitContent(content);
            setResult("Analyzing, 0% complete");
            splits.forEach(async (content, index: number) => {
                const partial = await getPartialSummary({content, password: userPass, randomness: userRandomness});
                if (!partial.error) {
                    ret.push({content: partial.result as string, index})
                } else {
                    ret.push({content: "", index})
                }
                if (ret.length === splits.length) {
                    const successRets = ret.filter(i => i.content.length > 0).sort((a, b) => {
                      return a.index - b.index
                    }).map(i => i.content);
                    if (successRets.length === 0) {
                        setResult("Operation Failed!!")
                    } else {
                        const complete = await groupSummaries({
                            content: successRets,
                            password: userPass,
                            randomness: userRandomness
                        });
                        if (!complete.error) {
                            setResult(complete.result as string)
                        } else {
                            setResult(complete.error as string)
                        }
                    }
                    setWaiting(false)
                } else {
                    setResult(`Analyzing, ${Math.floor(ret.length / splits.length * 100)} % complete`)
                }
            });
        } catch (error) {
            // Consider implementing your own error handling logic here
            console.error(error);
        }
    }

    return (
        <div>
            <main className="main">
                <h3>纪要总结</h3>
                <form onSubmit={(e) => {
                    if (waiting) {
                        return
                    }
                    setWaiting(true);
                    onSubmit(e)
                }}>
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        name="content"
                        placeholder="会议纪要"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
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
                    <input type="submit" value={waiting ? "生成纪要中。。。" : "归纳总结"}/>
                </form>
                <div className={"result"}>
                    <div dangerouslySetInnerHTML={{__html: result}}/>
                </div>
            </main>
        </div>
    );
}
