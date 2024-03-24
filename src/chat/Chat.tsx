import React, {useCallback, useMemo, useState} from 'react'
import {Button, Grid, Card, TextField, Typography, CardContent} from '@mui/material'
import OpenAICode from "../common/OpenAICode";
import {ChatFormat} from "../api/utils";
import './index.css'
import BasicMenu from "../common/BasicMenu";

const Chat = (props: {
    systemText: string,
    streaming: boolean,
    models: Array<{ text: string, value: string }>,
    selectedModel: { text: string, value: string },
    selectModel: (data: { text: string, value: string }) => void,
    messages: ChatFormat[],
    streamingMessage: string,
    onGenerate: (data: string) => Promise<void>,
    setSystemText: (data: string) => void,
}) => {

    const [userText, setUserText] = useState('');
    const buttonText = useMemo(() => {
        if (props.streaming) {
            return "Stop Generating"
        } else {
            return "Generate"
        }
    }, [props.streaming]);
    const onClick = useCallback(() => {
        props.onGenerate(userText);
        setUserText('')
    }, [userText, props.onGenerate]);
    return <Grid container sx={{height: "100%", width: "100%"}} spacing={3}>
        <Grid sx={{height: "100%"}} xs={8} columns={1}>
            <Card sx={{width: "100%", padding: "2rem"}}>
                <Typography variant="h5" component="div">
                    Enter message
                </Typography>
            </Card>
            <Card sx={{width: "100%", minHeight: 275, padding: "2rem"}}>
                <Grid container
                      direction="row"
                      justifyContent="space-around">
                    <TextField
                        label="Enter messages here"
                        placeholder="Enter something"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
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
            <Card sx={{width: '100%', overflowY: "hidden", padding: "0 2rem"}}>
                <CardContent>
                {props.messages.map((message, index) => {
                    return <Grid key={`${index}`} container columnSpacing={2}>
                        <Grid ><Typography variant="subtitle1" component="div">{message.role} :</Typography></Grid>
                        <Grid md={10}>{message.role === 'assistant' ? <OpenAICode text={message.content}/> :
                            <Typography variant="body2"
                                        sx={{maxWidth: "100%", workWrap: "break-word"}}>{message.content}</Typography>
                        }</Grid>
                    </Grid>
                })}
                {props.streamingMessage &&
                <Grid key="streamingMessage" container columnSpacing={2}>
                    <Grid ><Typography variant="subtitle1" component="div">assistant :</Typography></Grid>
                    <OpenAICode text={props.streamingMessage}/></Grid>}
                </CardContent>
            </Card>
        </Grid>
        <Grid sx={{height: "100%"}} xs={4}>
            <Card sx={{width: "100%", padding: "2rem", paddingTop: "2.5rem"}}>
                <TextField
                    label="Enter system message here here"
                    placeholder="Enter something"
                    value={props.systemText}
                    onChange={(e) => props.setSystemText(e.target.value)}
                    minRows='1'
                    maxRows='10'
                    multiline
                    sx={{height: "100%", flexGrow: 1, padding: "0.5rem"}}
                />
            </Card>
            <Card sx={{width: "100%", padding: "2rem", paddingTop: "2.5rem"}}>
                <BasicMenu
                    selected={props.selectedModel}
                    onItemSelect={(item) => props.selectModel(item)}
                    items={props.models}/>
            </Card>
        </Grid>
    </Grid>
};

export default Chat