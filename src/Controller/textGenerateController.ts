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



// async function transcribe(file: any) {
//     try {
//         console.log(file, 'file');
//         const response = await axios.post(
//             'https://api.openai.com/v1/audio/transcriptions',
//             {
//                 file,
//                 model: 'whisper-1'
//             },
//             {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
//                 }
//             }
//         );
//         console.log('**********');
//         return response.data.text;
//     } catch (error: any) {
//         console.log(error, 'error');
//         if (error.response && error.response.status === 429) {
//             console.log('---------------');
//             const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
//             console.log(`Rate limited. Retrying in ${retryAfter} seconds...`);
//             await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
//             await transcribe(file); // Retry the request

//         }
//         return error;

//     }
// }


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
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
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

//     apiKey: "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",



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
        const videoContent = "First introduced back in 2009 by Ryan Dahl at the annual European JS Conference. Node.js is an application runtime environment that allows you to write server-side applications in JavaScript. Built on top of the Chrome V8 JavaScript engine, it is capable of executing JS code outside of a web browser"
        // const generatedTitle = await generateVideoTitle(videoContent)
        //     .then(title => console.log('Generated Title:', title))
        //     .catch(err => console.error(err));
        const prompt = `Generate a title for the following text content: "${videoContent}"`;

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