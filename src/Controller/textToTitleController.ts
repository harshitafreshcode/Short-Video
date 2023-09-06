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
        const { text } = req.body;
        const inputText = `Generate only short and relevant Title from this given artical:${text}`      

        await api.completions
            .create({
                // engine: 'text-davinci-003', // You can specify the engine you want to use
                prompt: inputText,
                max_tokens: 20, // You can adjust the max_tokens to limit the length of the title
                model: 'text-davinci-003', // Specify the model here

            })
            .then((response: any) => {
                const generatedTitle = response.choices[0].text.trim();
                if (generatedTitle) {
                    var cleanedString = generatedTitle.replace(/\n/g, '');
                    cleanedString = cleanedString.replace(/"/g, '');
                    cleanedString = cleanedString.replace(/^\./, '');
                }
                res.json({ title: cleanedString })
            })
            .catch((error: any) => {
                console.error('Error:', error);
                res.send({ message: error.message });
            });


    } catch (error: any) {
        console.error('Error:', error.message);
        res.send({ message: error.message });

    }
}

