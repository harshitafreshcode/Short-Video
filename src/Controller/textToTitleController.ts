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
// const api = new openai({ key: apiKey });
const api = new openai({ key: apiKey });



// Set your OpenAI API key
// Function to generate titles based on input text
async function generateTitles(inputText: any, numTitles = 1) {
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt: `Generate ${numTitles} titles for the following text:\n\n${inputText}\n\nTitles:`,
            max_tokens: 20,  // Adjust the max_tokens as needed for longer titles
            n: numTitles,
            stop: null, // Ensure titles end at a line break
            temperature: 0.7,  // Adjust temperature for randomness
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        });


        const titles = response.data.choices.map((choice: any) => choice.text.trim());
        return titles;
    } catch (error: any) {
        console.error('Error:', error.message);
        return [];
    }
}

export const titleClip = async (req: Request, res: Response) => {
    try {

        // Example text for title generation
        const inputText = `It's easy to get started and can be used for prototyping and agile development. It provide fast and highly scalable services. Large ecosystem for open source library. Source code is cleaner and consistent. It uses Javascript everywhere so it's easy for a Javascript programmer to build backend services using Node.js. Use Node.js for own-tend or backend.`
        // Generate titles based on the input text
        generateTitles(inputText)
            .then(titles => {
                console.log(titles, 'titles');
                let a: any = []
                titles.forEach((title: any, index: any) => {
                    console.log(`Title ${index + 1}: ${title}\n`);
                    a.push(title)
                });
                console.log(titles[0], 'titles[0].title');
                res.json({ title: titles[0] })
            })
            .catch(err => {
                console.error('Error:', err);
                res.send(err)

            });



    } catch (error: any) {
        console.error('Error:', error.message);
        return [];
    }
}

