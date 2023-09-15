import { Request, Response } from "express";
import { AppDataSource } from "./config/db";
import routes from "./routes/routes";
import swaggerSpec1 from "./Swagger/swaggerConfig";
import bodyParser from "body-parser";
import userRouter from "./routes/user";
import axios from "axios";
const passport = require('passport');
const session = require('express-session');
const ClientID = "659003527104-16k41adnjoqgdg8m291lpeq2jkfciikq.apps.googleusercontent.com"
const clientSercert = "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"
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../src/config/Client_data.json');
const Meeting = require('google-meet-api').meet;

const { google } = require('googleapis');

const express = require('express');
const app = express();
const port = 3000;

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

const client = new OAuth2Client(ClientID, clientSercert, 'http://localhost:3000/auth/google/callback');


app.use(passport.initialize());
app.use(passport.session());
// Middlewares
/* To handle invalid JSON data request */
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: '659003527104-16k41adnjoqgdg8m291lpeq2jkfciikq.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        (accessToken: any, refreshToken: any, profile: any, done: any) => {
            // You can handle user creation or login logic here.
            // 'profile' will contain user information from Google.
            return done(null, profile);
        }
    )
);

app.get('/auth/google', async (req: any, res: any) => {
    const authUrl = await client.generateAuthUrl({
        access_type: 'offline', // Get a refresh token for long-term access
        scope: ['https://www.googleapis.com/auth/calendar'], // Specify the scope of access
    });
    console.log(authUrl, 'authUrl');
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req: any, res: any) => {

    const code = req.query.code;

    try {
        const { tokens } = await client.getToken(code);
        console.log(tokens, 'tokens');
        console.log(tokens?.refresh_token, 'tokens.refresh_token');

        client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: client });
        const event = {
            summary: 'Meeting Title',
            start: {
                dateTime: '2023-09-13T14:02:00',
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: '2023-09-13T15:00:00',
                timeZone: 'Asia/Kolkata',
            },
            conferenceData: {
                createRequest: {
                    requestId: 'your-unique-request-id',
                },
            },
        };
        calendar.events.insert(
            {
                auth: client,
                calendarId: 'primary', // Use 'primary' for the user's primary calendar.
                resource: event,
                conferenceDataVersion: 1,
            },
            (err: any, event: any) => {
                if (err) {
                    console.error('Error creating event:', err);
                    res.status(500).send('Error creating Google Meet event.');
                } else {
                    // Meeting({
                    //     clientId: ClientID,
                    //     clientSecret: clientSercert,
                    //     // refreshToken: 'XXXXXXXXXCNfW2MMGvJUSk4V7LplXAXXXX',
                    //     date: "2023-09-13",
                    //     time: "14:44",
                    //     summary: 'summary',
                    //     location: 'location',
                    //     description: 'test demo'
                    // }).then(function (result: any) {
                    //     // console.log(result);
                    //     console.log('result', result);
                    // })
                    res.send('Google Meet event created: ' + event.data.htmlLink);
                }
            }
        );

    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Error getting access token');
    }
});

app.post('/google-calendar', async (req: any, res: any) => {
    const { OAuth2Client } = require('google-auth-library');
    const client = await new OAuth2Client(ClientID, clientSercert, 'http://localhost:3000/auth/google/callback');
    const calendar = google.calendar({ version: 'v3', auth: client });
    const accessToken = "ya29.a0AfB_byBlwqs06B_2QpCPsCx3S4wDVHQ7KNoZD7JRdXbs95ZFAURpDb5kHfFd8CcnBDEcB8iGiw9r4NCUwKPYatwDxpBbO7K4bLYYHAH6McRNOvlKnF5Pu48dOAps9mbue-ZDpws3LJ1eI_E_JwmTvKozbxn6PNkk4p0aCgYKAUISARASFQGOcNnCCCkL2jXhz63GxoPRmE8wNQ0170"
    try {

        const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                timeMin: new Date().toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            },
        });
        console.log(response, 'events');
        const events = response?.data?.items;
        console.log('Upcoming Events:');
        events.forEach((event: any) => {
            console.log(`- ${event.summary} (Start: ${event.start.dateTime})`);
        });

        return res.send(response?.data)

    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Error getting access token');
    }
});

// app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/fail' }), (req: any, res: any) => {
//     // Successful authentication, redirect or respond as needed.
//     console.log('req.use', req.use);
//     console.log('req.isAuthenticated', req.isAuthenticated());
//     res.send("Your Are Authorized")
// });
passport.serializeUser(function (user: any, done: any) {
    console.log('f', user);
    done(null, user);
});

passport.deserializeUser(function (user: any, done: any) {
    console.log('s', user);
    done(null, user);
});
app.get('/logout', (req: any, res: any) => {
    req.logout();
    res.redirect('/');
});

// Logout route
app.get('/logout', (req: any, res: any) => {
    req.logout();
    res.redirect('/');
});

app.use(bodyParser.json({ limit: '50mb' }));

/* For parsing urlencoded data */
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use('/', routes) //main route
app.use('/', userRouter) // check multiple route

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec1));


app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
})

// AppDataSource.initialize().then(() => {
//     console.log("Connected to Postgres Database")

// }).catch((error) => {
//     console.log('Database Connection Failed : ', error)
// })
