import React, {useCallback, useMemo, useRef, useState} from 'react'
import {throttle} from 'underscore'
import {Button, Grid, Card, TextField, Container, Typography, CardContent} from '@mui/material'
import {useGenUT} from "../api";
import './index.css'
import OpenAICode from "../common/OpenAICode";

export default function GenerateUT() {

    const [code, setCode] = useState('');
    const [ut, setUT] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [abortSig, setAbortSig] = useState<AbortController | null>(null);
    const streamCache = useRef("");
    const updateStreamCache = useCallback(throttle(() => {
        setUT(`${streamCache.current}`)
    }, 400), []);
    const {openStream, closeStream} = useGenUT({
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
    const buttonText = useMemo(() => {
        if (streaming) {
            return "Stop Generating"
        } else {
            return "Generate"
        }
    }, [streaming]);
    const onClick = useCallback(async () => {
        if (!abortSig) {
            setUT("");
            streamCache.current = '';
            setStreaming(true);
            setAbortSig(openStream({code}))
        } else {
            closeStream(abortSig);
            setAbortSig(null);
            setStreaming(false);
            setUT(streamCache.current)
        }
    }, [code, abortSig, openStream, closeStream]);
    return <Container maxWidth={'md'} sx={{height: "100%"}}>
        <Card sx={{minWidth: 275, padding: "2rem"}}>
            <Typography variant="h5" component="div">
                Generate Go UT
            </Typography>
        </Card>
        <Card sx={{minWidth: 275, minHeight: 275, padding: "2rem"}}>
            <Grid
                container
                direction="row"
                justifyContent="space-around">
                <TextField
                    label="Enter code here"
                    placeholder="Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    minRows={'3'}
                    maxRows='10'
                    multiline
                    sx={{height: "100%", flexGrow: 1, paddingRight: "0.5rem"}}
                />
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                    <Button variant="outlined" onClick={onClick}>{buttonText}</Button>
                </div>
            </Grid>
        </Card>
        <Card sx={{minWidth: 275, maxWidth: '100%', overflowY: "hidden"}}><CardContent>
            <Typography variant="h5" component="div">
                Results:
            </Typography>
            <OpenAICode text={ut.trim()}/>
        </CardContent></Card>
    </Container>
};