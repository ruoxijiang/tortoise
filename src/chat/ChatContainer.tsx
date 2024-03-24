import React, {useCallback, useEffect, useRef, useState} from "react";
import {ChatFormat, ChatParam} from "../api/utils";
import {throttle} from "underscore";
import {fetchModelList, useGenChat} from "../api";
import Chat from "./Chat";

const ChatContainer = () => {
    const [systemText, setSystemText] = useState('You are a helpful assistant');
    const [chatParam, setChatParam] = useState<ChatParam>({
        temperature: 0.2
    });
    const [models, setModels] = useState<Array<{text: string, value: string}>>([]);
    useEffect(()=> {
        fetchModelList().then(resp => {
            if(!resp.error && Array.isArray(resp.result)){
                setModels(resp.result.map(item => {
                    return {text: item.id, value: item.id}
                }))
            }
        })
    }, []);
    const [selectedModel, setSelectedModel] = useState({text: "gpt-3.5-turbo", value: "gpt-3.5-turbo"});
    const [messages, setMessages] = useState<ChatFormat[]>([]);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [abortSig, setAbortSig] = useState<AbortController | null>(null);
    const streamCache = useRef("");
    const updateStreamCache = useCallback(throttle(() => {
        setStreamingMessage(`${streamCache.current}`)
    }, 400), []);
    const {openStream, closeStream} = useGenChat({
        onData: (data: string) => {
            console.log(data);
            streamCache.current = `${streamCache.current}${data}`;
            updateStreamCache()
        },
        onError: () => {
            setStreaming(false);
            setAbortSig(null);
        },
        onOpen: () => {
            setStreaming(true)
        },
        onClose: () => {
            setStreaming(false);
            setAbortSig(null);
        }
    });
    const onClick = useCallback(async (userText: string) => {
        if (!abortSig) {
            const tmp = messages.slice();
            if(streamCache.current){
                tmp.push({role: 'assistant', content: streamCache.current})
            }
            tmp.push({role: "user", content: userText});
            setMessages(tmp);
            setStreamingMessage("");
            streamCache.current = '';
            setStreaming(true);
            setAbortSig(openStream({systemText, messages: tmp, ...chatParam, model: selectedModel.value}))
        } else {
            closeStream(abortSig);
            setAbortSig(null);
            setStreaming(false);
            setStreamingMessage(streamCache.current)
        }
    }, [abortSig, openStream, closeStream, messages]);
    return <Chat messages={messages}
                 models={models}
                 selectedModel={selectedModel}
                 selectModel={setSelectedModel}
                 systemText={systemText}
                 setSystemText={setSystemText}
                 onGenerate={onClick}
                 streaming={streaming} streamingMessage={streamingMessage}/>
};

export default ChatContainer