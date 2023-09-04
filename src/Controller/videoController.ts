import { Request, Response } from "express";
import { ErrorResponse, successResponse } from "../helpers/apiResponse";
import ytdl from 'ytdl-core';
import * as fs from 'fs';
import * as path from 'path';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);



async function downloadVideo(url: string): Promise<string> {
    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters from title
        const outputPath = path.join('src/inputFile', `${videoTitle}.mp4`);

        const videoStream = ytdl(url, { quality: 'highest' });
        console.log('1');
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream(outputPath);
            videoStream.pipe(outputStream);

            outputStream.on('finish', () => {
                outputStream.close();
                resolve(outputPath);
            });

            outputStream.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error: any) {
        return error
    }
}
async function cutVideo(inputPath: string, videoTitle: string) {
    try {
        const outputFolder = path.join('src/', 'clip');
        // fs.mkdirSync(outputFolder, { recursive: true });

        const duration = 30; // 30 seconds
        const videoDuration = Math.floor(await getVideoDuration(inputPath));
        const numClips = Math.ceil(videoDuration / duration);

        for (let i = 0; i < numClips; i++) {
            const startTime = i * duration;
            const outputFileName = `clip-${videoTitle}-${i + 1}.mp4`;
            const outputPath = path.join(outputFolder, outputFileName);

            await new Promise((resolve: any, reject: any) => {
                ffmpeg()
                    .input(inputPath)
                    .outputOptions(['-c:v libx264', '-crf 22'])
                    .inputOption(`-ss ${startTime}`)
                    .inputOption(`-t ${duration}`)
                    .output(outputPath)
                    .on('end', () => {
                        console.log(`Clip ${i + 1} created`);
                        resolve();
                    })
                    .on('error', (err: any) => {
                        console.error(`Error creating clip ${i + 1}:`, err);
                        reject(err);
                    })
                    .run();
            });

            // await ffmpeg()
            //     .input(inputPath)
            //     .outputOptions(['-c:v libx264', '-crf 22'])
            //     .inputOption(`-ss ${startTime}`)
            //     .inputOption(`-t ${duration}`)
            //     .output(outputPath)
            //     .on('end', () => console.log(`Clip ${i + 1} created`))
            //     .run();
        }
    } catch (error: any) {
        return error;
    }
}
async function getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err: any, metadata: any) => {
            if (err) {
                reject(err);
            } else {
                const duration = metadata.format.duration;
                resolve(duration);
            }
        });
    });
}
// export const generateClip = async (req: Request, res: Response) => {
//     try {
//         const { youtubeURL } = req.body;
//         const videoInfo = await ytdl.getInfo(youtubeURL);
//         const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters from title
//         console.log('0');

//         const videoPath = await downloadVideo(youtubeURL);
//         console.log('first0', videoPath);

//         cutVideo(videoPath, videoTitle);
//         console.log('4');

//         res.send(videoPath)

//     } catch (error) {
//         console.error('Error downloading video:', error);
//         res.status(500).json({ message: 'Error downloading video' });
//     }
// }



//


async function generateClipsSequentially(inputPath: any, videoTitle: string, numClips: number) {
    const outputFolder = path.join('src/', 'clip');
    // fs.mkdirSync(outputFolder, { recursive: true });

    const duration = 30; // 30 seconds

    for (let i = 0; i < numClips; i++) {
        const startTime = i * duration;
        const outputFileName = `clip-${videoTitle}-${i + 1}.mp4`;
        const outputPath = path.join(outputFolder, outputFileName);

        try {
            await new Promise((resolve: any, reject: any) => {
                ffmpeg()
                    .input(inputPath)
                    // .outputOptions(['-c:v libx264', '-crf 22'])
                    .outputOptions('-fs 10M') // Limit clip size to 10MB (adjust as needed)
                    .inputOption(`-ss ${startTime}`)
                    .inputOption(`-t ${duration}`)
                    .output(outputPath)
                    .on('end', () => {
                        console.log(`Clip ${i + 1} created`);
                        resolve();
                    })
                    .on('error', (err: any, stdout: any, stderr: any) => {
                        console.error(`Error creating clip ${i + 1}:`, err);
                        console.error('FFmpeg STDERR:', stderr); // Log FFmpeg's error output

                        reject(err);
                    })
                    .run();
            });
        } catch (error: any) {
            console.error('Error generating clips:', error);
        }
    }

    console.log('All clips generated.');
}

// Usage in your route handler
export const generateClip = async (req: Request, res: Response) => {
    try {
        const { youtubeURL } = req.body;
        const videoInfo = await ytdl.getInfo(youtubeURL);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
        const outputDirectory = 'src/clip';

        const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
        const clipDuration = 30; // 30 seconds per clip

        let clipNumber = 1;
        let startTime = 0;

        while (startTime < duration) {
            const clipTitle = `clip_${clipNumber}.mp4`;
            const outputPath = path.join(outputDirectory, clipTitle);

            const video = ytdl(youtubeURL, { filter: 'audioandvideo' });

            await new Promise((resolve: any, reject: any) => {
                ffmpeg(video)
                    .setStartTime(startTime)
                    .setDuration(clipDuration)
                    .outputOptions('-c:v libx264')
                    .output(outputPath)
                    .on('end', () => {
                        console.log(`Clip ${clipNumber} created`);
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


        res.status(201).json({ message: "Your Video Clip Is Ready", youtubeURL: youtubeURL });
    } catch (error) {
        console.error('Error generating clips:', error);
        res.status(500).json({ message: 'Error generating clips' });
    }
}






export const createVideos = async (req: Request, res: Response) => {
    try {

        const inputFilePath = 'src/inputFile/v1.mp4';
        const outputDirectory = 'src/clip/';
        const numClips = 2; // Number of clips to create
        const clipDuration = 30; // Duration of each clip in seconds


        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
        }

        const promises = [];

        for (let i = 0; i < numClips; i++) {

            const clipOutputPath = `${outputDirectory}clip_${i + 1}.mp4`;
            const startTime = i * clipDuration;

            await ffmpeg()
                .input(inputFilePath)
                .setStartTime(startTime)
                .setDuration(clipDuration)
                .output(clipOutputPath)
                .on('end', () => {
                    console.log(`Clip ${i + 1} cutting process finished.`);
                    // return successResponse(res, "Video Created Successfully", []);

                })
                .on('error', (err: any) => {

                    console.error(`Error cutting clip ${i + 1}:`, err);
                    return successResponse(res, "Video Created Successfully", err);
                })
                .run();
        }


        return successResponse(res, "Video Created Successfully", []);



        // ffmpeg()
        //     .input(inputFilePath)
        //     .setStartTime(startTime)
        //     .setDuration(duration)
        //     .output(outputFilePath)
        //     .on('end', () => {
        //         console.log('Video cutting process finished.');
        // return successResponse(res, "Video Created Successfully", []);

        //     })
        //     .on('error', (err: any) => {
        //         console.error('Error cutting video:', err);
        // return successResponse(res, "Video Created Successfully", err);

        //     })
        //     .run();


        // splitVidoes(where, payloadRequest, (err: any, data: any) => {
        //     if (err) {
        //         return ErrorResponse(res, err);
        //     } else {
        //     }
        // });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};

export const getVideosInfo = async (req: Request, res: Response) => {
    try {

        const inputFilePath = 'src/inputFile/v1.mp4';
        // const outputDirectory = 'src/clip/';
        // const numClips = 2; // Number of clips to create
        // const clipDuration = 30; // Duration of each clip in seconds


        // if (!fs.existsSync(outputDirectory)) {
        //     fs.mkdirSync(outputDirectory);
        // }

        await ffmpeg.ffprobe(inputFilePath, (err: any, metadata: any) => {
            if (err) {
                console.error('Error getting clip details:', err);
            } else {
                console.log('Clip details:', metadata);
                return successResponse(res, "Video Created Successfully", metadata.format.duration);
            }
        });






        // ffmpeg()
        //     .input(inputFilePath)
        //     .setStartTime(startTime)
        //     .setDuration(duration)
        //     .output(outputFilePath)
        //     .on('end', () => {
        //         console.log('Video cutting process finished.');
        // return successResponse(res, "Video Created Successfully", []);

        //     })
        //     .on('error', (err: any) => {
        //         console.error('Error cutting video:', err);
        // return successResponse(res, "Video Created Successfully", err);

        //     })
        //     .run();


        // splitVidoes(where, payloadRequest, (err: any, data: any) => {
        //     if (err) {
        //         return ErrorResponse(res, err);
        //     } else {
        //     }
        // });
    } catch (e) {
        console.log(e);
        ErrorResponse(res, e);
    }
};
