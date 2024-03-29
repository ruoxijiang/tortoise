import React, {useCallback, useEffect, useMemo} from 'react'
import {throttle} from 'underscore'
import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import 'highlight.js/styles/github.css';
import {Typography} from "@mui/material";

type CodeBreak = {
    start: number,
    end: number
}
const defaultBreak = '```';
const offSet = defaultBreak.length;
export default function OpenAICode(props: { text: string }) {
    useEffect(() => {
        hljs.registerLanguage("go", go);

    }, []);
    const highlight = useCallback(throttle(()=> {
        console.log('called highlight');
        hljs.highlightAll()
    }, 800), []);
    const codeBreakPositions: Array<CodeBreak> = useMemo<Array<CodeBreak>>((): CodeBreak[] => {
        if (props.text.length === 0) {
            return []
        } else {
            const ret = [];
            let start = props.text.indexOf(defaultBreak);
            let end = props.text.length;
            while (start !== -1) {
                if (ret.length !== 0) {
                    start = start + end + offSet
                }
                end = props.text.slice(start + offSet).indexOf(defaultBreak);
                if (end === -1) {
                    end = props.text.length;
                } else {
                    end = start + offSet + end
                }
                ret.push({start, end});
                start = props.text.slice(end + offSet).indexOf(defaultBreak)
            }
            highlight();
            return ret;
        }
    }, [props.text.length, highlight]);
    if (codeBreakPositions.length === 0) {
        return <Typography variant="body2" sx={{maxWidth: "100%", workWrap: "break-word"}}>{props.text}</Typography>
    }
    return <>{codeBreakPositions.map((breakPoint, index) => {
        const ret = [];
        if (index === 0) {
            if (breakPoint.start !== 0) {
                ret.push(<Typography variant="body2" key={`before:${index}`}
                                     sx={{maxWidth: "100%"}}>{props.text.slice(0, breakPoint.start)}</Typography>)
            }
        }
        ret.push(<pre key={`code:${index}`}><code className="language-go">{props.text.slice(breakPoint.start + offSet, breakPoint.end)}</code></pre>)
        if ((index + 1) === codeBreakPositions.length && breakPoint.end !== props.text.length) {
            ret.push(<Typography variant="body2" key={`after:${index}`}
                                 sx={{maxWidth: "100%"}}>{props.text.slice(breakPoint.end + offSet)}</Typography>)
        }
        return ret
    })}</>;
}