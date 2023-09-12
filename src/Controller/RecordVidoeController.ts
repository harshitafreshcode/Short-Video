import axios from "axios";
import { Request, Response } from "express";

const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const puppeteer = require('puppeteer');


export const recordVidoe = async (req: Request, res: Response) => {

  const ffmpeg = spawn(`${ffmpegPath}`, [
    '-f', 'gdigrab',
    '-framerate', '30',
    '-video_size', '800,600',
    // '-i', 'desktop',
    // '-f', 'dshow',
    // '-i', 'audio="Microphone Array(Realtalk Audio)"', // Replace with your audio source
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-c:a', 'aac',
    '-strict', 'experimental',
    '-f', 'mp4',               // Output format (mp4)

    'src/Videos/output.mp4'             // Output file name
  ]);


  // Handle FFmpeg output and errors
  ffmpeg.stdout.on('data', (data: any) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data: any) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  // Handle FFmpeg process exit
  ffmpeg.on('close', (code: any) => {
    console.log(`FFmpeg process exited with code ${code}`);
    res.json({ message: 'Screen recording completed.' });
  });

  // Gracefully exit FFmpeg process on Node.js process exit
  process.on('exit', () => {
    ffmpeg.kill('SIGINT');
  });


  //?1st way

  // try {

  //   // Define the input options (e.g., video source, resolution, framerate, etc.)
  //   const inputOptions = {
  //     format: 'dshow', // Input format (Video4Linux2 for webcams)
  //     framerate: 30,  // Frame rate
  //     video_size: '1280x720', // Video resolution
  //     input: 'video="Integrated Webcam"' // Video input device
  //   };
  //   console.log('1');
  //   // Define the output options (e.g., codec, output file)
  //   const outputOptions = {
  //     codec: 'libx264', // Video codec
  //     videoBitrate: '1000k', // Video bitrate
  //     format: 'mp4', // Output format
  //     output: 'output.mp4' // Output file name
  //   };

  //   // Create an FFmpeg command
  //   const command = ffmpeg()
  //     .input(inputOptions)
  //     .output(outputOptions)
  //     .on('end', () => {
  //       console.log('Video recording finished');
  //     })
  //     .on('error', (err: any) => {
  //       console.error('Error:', err);
  //     });

  //   // Run the FFmpeg command
  //   command.run();
  // } catch (error) {
  //   console.error('Error generating clips:', error);
  //   res.status(500).json({ message: error });
  // }
}

export const VidoeRecord = async (req: Request, res: Response) => {
  const authToken = "ya29.a0AfB_byCAsZd6KTAmBi_TFf3LDdGGuSIx4FYxN85_-UbUqoXljb7RSdt08uSAawH36wwwzmJwi9FMYBOjGZ9obsx6gqH7VZldYCXSNdBNOzlXtbsNHTLh8GTcRh1lLlYxIOnShEmzGIKiqmqdHGpvizWFIkEPOHpyPQaCgYKAQkSARASFQGOcNnCT32aTanPjwdVHN13Lkhk6A0169"
  try {
    const apiUrl = 'https://botsondemand.googleapis.com/v1/createConferenceWithBots'; // Replace with the actual API URL
    const postData = {
      "numOfBots": 1,
      "ttlSecs": 100
    }
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json', 
    };
    console.log(headers, 'headers');
    axios.post(apiUrl, postData, { headers })
      .then(function (response) {
        console.log('POST request successful');
        console.log('Response data:', response.data);
        res.send('successfull')
      })
      .catch(function (error) {
        console.error('Error making POST request:', error);
        res.status(500).json({ message: error });
      });
  } catch (error) {
    res.status(500).json({ message: error });
  }

}


export const calendars = async (req: Request, res: Response) => {
  
  const authToken = "ya29.a0AfB_byCAsZd6KTAmBi_TFf3LDdGGuSIx4FYxN85_-UbUqoXljb7RSdt08uSAawH36wwwzmJwi9FMYBOjGZ9obsx6gqH7VZldYCXSNdBNOzlXtbsNHTLh8GTcRh1lLlYxIOnShEmzGIKiqmqdHGpvizWFIkEPOHpyPQaCgYKAQkSARASFQGOcNnCT32aTanPjwdVHN13Lkhk6A0169"
  try {
    const apiUrl = 'https://botsondemand.googleapis.com/v1/createConferenceWithBots'; // Replace with the actual API URL
    const postData = {
      "numOfBots": 1,
      "ttlSecs": 100
    }
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json', 
    };
    console.log(headers, 'headers');
    axios.post(apiUrl, postData, { headers })
      .then(function (response) {
        console.log('POST request successful');
        console.log('Response data:', response.data);
        res.send('successfull')
      })
      .catch(function (error) {
        console.error('Error making POST request:', error);
        res.status(500).json({ message: error });
      });
  } catch (error) {
    res.status(500).json({ message: error });
  }

}




// export const VidoeRecord = async (req: Request, res: Response) => {
//   const meetingLink = "https://meet.google.com/hra-vxng-spy";

//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Navigate to the Google Meet link
//     await page.goto(meetingLink);

//     // Automate the process of joining the meeting
//     // await page.click('[aria-label="Join meeting"]');
//     await page.waitForSelector('[aria-label="Join now"]');
//     await page.click('[aria-label="Join now"]');

//     // You can handle permissions here if needed

//     // Close the browser after joining the meeting
//     await browser.close();

//     res.status(200).json({ message: 'Bot user successfully joined the meeting.' });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Error joining the meeting.' });
//   }
// }