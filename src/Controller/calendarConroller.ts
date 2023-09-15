import { Request, Response } from "express";
const ClientID = "659003527104-16k41adnjoqgdg8m291lpeq2jkfciikq.apps.googleusercontent.com"
const clientSercert = "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"
const { google } = require('googleapis');
const calendar = google.calendar('v3');
const { OAuth2Client } = require('google-auth-library');
const OAuth2 = google.auth.OAuth2;

export const calendars = async (req: Request, res: Response) => {

  try {

    const oauth2Client = new OAuth2Client(
      ClientID,
      clientSercert,
      'http://localhost:3000/auth/google/callback'
    );

    // Generate a URL for the user to authenticate
    const authUrl = await oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get a refresh token for long-term access
      scope: ['https://www.googleapis.com/auth/calendar'], // Specify the scope of access
    });
    console.log(authUrl, 'authUrl');
    // Redirect the user to authUrl to obtain an authorization code
    const readline = require('readline');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the authorization code: ', (code: any
    ) => {
      oauth2Client.getToken(code, (err: any, tokens: any) => {
        if (err) {
          console.error('Error getting access token:....', err);
          return res.send(err);
        }

        oauth2Client.setCredentials(tokens);

        const event = {
          summary: 'Meeting Title',
          start: {
            dateTime: '2023-09-13T10:00:00',
            timeZone: 'Asia/Kolkata',
          },
          end: {
            dateTime: '2023-09-13T11:00:00',
            timeZone: 'Asia/Kolkata',
          },
          conferenceData: {
            createRequest: {
              requestId: 'your-unique-request-id',
            },
          },
        };
        console.log('eventss');
        calendar.events.insert(
          {
            auth: oauth2Client,
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
          },
          (err: any, event: any) => {
            if (err) {
              console.error('Error creating event:', err);
              return res.send(err);
            }

            console.log('Event created: %s', event.data.htmlLink);
            return res.send(event.data.htmlLink);
          }
        );

      });
    });



  } catch (error) {
    res.status(500).json({ message: error });
  }

}


