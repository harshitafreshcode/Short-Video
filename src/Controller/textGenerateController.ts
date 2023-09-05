import { Request, Response } from "express";
import { ErrorResponse, successResponse } from "../helpers/apiResponse";
import ytdl from 'ytdl-core';
import * as fs from 'fs';
import * as path from 'path';
import axios from "axios";
const { Readable } = require("stream");

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

require('dotenv').config();
const openai = require('openai');
const { OpenAIApi } = require('openai');

const apiKey = `${process.env.OPENAI_API_KEY}`;

// Initialize the OpenAI API client
const api = new openai({ key: apiKey });






// to create a short reels Ffmpeg
export const generateClips = async (req: Request, res: Response) => {
    try {
        const { youtubeURL } = req.body;
        const videoInfo = await ytdl.getInfo(youtubeURL);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
        const outputDirectory = 'src/clip';

        const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
        const clipDuration = 30; // 30 seconds per clip

        let clipNumber = 1;
        let startTime = 0;

        let videoTextDetail: any = []
        while (startTime < duration) {
            const clipTitle = `clip_${clipNumber}.mp4`;
            const outputPath = path.join(outputDirectory, clipTitle);

            const video = ytdl(youtubeURL, { filter: 'audioandvideo' });
            await new Promise(async (resolve: any, reject: any) => {
                await ffmpeg(video)
                    .setStartTime(startTime)
                    .setDuration(clipDuration)
                    .outputOptions('-c:v libx264')
                    .output(outputPath)
                    .on('end', async () => {
                        console.log(`Clip ${clipNumber} created`);
                        const file = await fs.createReadStream(outputPath);
                        const transcript = await transcribe(file);
                        let obj = {
                            path: outputPath,
                            text: transcript
                        }
                        videoTextDetail.push(obj)

                        resolve();
                    })
                    .on('error', (err: any) => {
                        console.error(`Error creating clip ${clipNumber}:`, err);
                        reject(err);
                    })
                    .run();
            });

            startTime += clipDuration;
            clipNumber++;
        }


        res.status(201).json({ message: "Your Video Clip Is Ready", videoTextDetail: videoTextDetail });
    } catch (error) {
        console.error('Error generating clips:', error);
        res.status(500).json({ message: 'Error generating clips' });
    }
}


async function transcribe(file: any) {
    try {
        console.log(file, 'file');
        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            {
                file,
                model: 'whisper-1'
            },
            {
                // timeout: 15000,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer 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`
                }
            }
        );
        console.log('***********');

        return response.data.text;
    } catch (error: any) {
        console.error('Transcription request error:', error);
        if (error.response && error.response.status === 429) {
            console.log('Rate limited. Retrying...', error.response.headers['retry-after']);
            const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
            const delayInSeconds = Math.min(retryAfter * 2, 60); // Use exponential backoff with max delay of 60 seconds

            // Wait for the specified retry duration with exponential backoff
            await new Promise(resolve => setTimeout(resolve, delayInSeconds * 1000));
            return transcribe(file); // Retry the request
        }


        // Handle other errors`
        return error;
    }
}

export const generateClipText = async (req: Request, res: Response) => {
    try {
        const file = fs.createReadStream('src/clip/clip_1.mp4');
        const transcript = await transcribe(file);

        console.log(transcript);
        res.status(201).json({ message: "Your Video Clip Text Successfully Created  ", transcript: transcript });
    } catch (error) {
        console.error('Error generating clips:', error);
        res.status(500).json({ message: 'Error generating clips' });
    }
}


async function generateVideoTitle(videoContent: any) {
    const prompt = `Generate a title for the following video content: "${videoContent}"`;

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt,
            max_tokens: 500, // Adjust the maximum number of tokens in the generated title
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
        });
        // console.log(response.data);
        const generatedTitle = response.data.choices[0].text.trim();
        console.log(generatedTitle, 'generatedTitle');
        return generatedTitle;
    } catch (error) {
        console.error('Error generating video title:', error);
        throw error;
    }
}

// Example usage
export const generateClipTitle = async (req: Request, res: Response) => {
    try {
        const videoContent = "Node.js Ultimate Beginner’s Guide in 7 Easy Steps"
        // const generatedTitle = await generateVideoTitle(videoContent)
        //     .then(title => console.log('Generated Title:', title))
        //     .catch(err => console.error(err));
        const prompt = `${videoContent}`;

        await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt,
            max_tokens: 20, // You can adjust the output length as needed
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
        })
            .then(response => {
                const generatedTitle = response.data.choices[0].text.trim();
                console.log('Generated Title:', response.data);
                res.status(201).json({ message: "Your Video Clip Title Successfully Created  ", generatedTitle: generatedTitle });
            })
            .catch(error => {
                console.error('Error generating title:', error);
            });



    } catch (error) {
        console.error('Error generating clips:', error);
        res.status(500).json({ message: 'Error generating clips' });
    }
}



export const generateClipTitleUsingRapid = async (req: Request, res: Response) => {
    try {
        // console.log('12');
        // const videoContent = "First introduced back in 2009 by Ryan Dahl at the annual European JS Conference. Node.js is an application runtime environment that allows you to write server-side applications in JavaScript. Built on top of the Chrome V8 JavaScript engine, it is capable of executing JS code outside of a web browser"
        // // const generatedTitle = await generateVideoTitle(videoContent)
        // //     .then(title => console.log('Generated Title:', title))
        // const options = {
        //     method: 'POST',
        //     url: 'https://tldrthis.p.rapidapi.com/v1/model/abstractive/summarize-text/',
        //     headers: {
        //         'content-type': 'application/json',
        //         'X-RapidAPI-Key': '02e651eb1emsh32de991b2287b0bp1393f1jsn2de42f1e54a0',
        //         'X-RapidAPI-Host': 'tldrthis.p.rapidapi.com'
        //     },
        //     data: {
        //         text: 'Six years after Yahoo purchased Tumblr for north of $1 billion, its parent corporation is selling the once-dominant blogging platform. WordPress owner Automattic Inc. has agreed to take the service off of Verizon’s hands. Terms of the deal are undisclosed, but the number is “nominal,” compared to its original asking price, per an article in The Wall Street Journal.',
        //         min_length: 100,
        //         max_length: 300
        //     }
        // };



        // try {
        //     const response = await axios.request(options);
        //     console.log(response, 'response');
        //     console.log(response.data);
        //     res.send(response.data);
        // } catch (error) {
        //     console.error(error);
        //     res.send(error);
        // }



        // const text = 'This is a blog post about Node.js';

        // const title = titleGenerator(text);

        // console.log(title);
        const options = {
            method: 'POST',
            url: 'https://api.copy.ai/api/workflow/PKGW-a5d88de1-474f-4618-ab1f-5e9e00b2a9fe/run',
            headers: { 'Content-Type': 'application/json', 'x-copy-ai-api-key': 'e4ae9419-7534-4af2-b9bf-3f26a56404ce' },
            data: {
                startVariables: {
                    "Input 1": "Can you Generate title for node js tutorails?",
                    // "Input 2": "<The best way to see an example is to try it!>"

                }, metadata: { api: true }
            }
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                res.send(response.data);
            })
            .catch(function (error) {
                console.error(error);
                res.send(error);
            });

    } catch (error) {
        console.error('Error generating clips:', error);
        res.status(500).json({ message: 'Error generating clips' });
    }
}

