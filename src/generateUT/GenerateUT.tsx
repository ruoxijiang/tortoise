import React, {useCallback, useState} from 'react'
import {Button, Grid, Card, TextField, Container, Typography, CardContent } from '@mui/material'
import {generateUT} from "../api";
export default function GenerateUT() {
    const [code, setCode] = useState('');
    const [ut, setUT] = useState('');
    const onSubmit = useCallback(async ()=> {
        setUT("Generating results...");
        try {
            const data = await generateUT(code);
            if (data.error){
                setUT(data.error as string)
            } else {
                setUT(data.result as string)
            }
        } catch(e: any) {
                setUT(e.message)
        }
    }, [code]);
    return <Container maxWidth={'md'} sx={{height: "100%"}}>
        <Card sx={{ minWidth: 275, padding: "2rem" }}>
            <Typography variant="h5" component="div">
                Generate Go UT
            </Typography>
        </Card>
        <Card sx={{ minWidth: 275, minHeight: 275, padding: "2rem" }}>
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
                    <Button variant="outlined" onClick={onSubmit}>Generate</Button>
                </div>
        </Grid>
        </Card>
        <Card sx={{ minWidth: 275 }}><CardContent>
            <Typography variant="h5" component="div">
            Results:
        </Typography>
            <Typography variant="body2"><pre><code dangerouslySetInnerHTML={{__html: ut}}/></pre></Typography>
        </CardContent></Card>
    </Container>
};