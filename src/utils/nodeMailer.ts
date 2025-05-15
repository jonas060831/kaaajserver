import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const email = process.env.GOOGLE_EMAIL;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const clientId = process.env.GOOGLE_CLIENT_ID;

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err || !token) {
        console.error(err);
        return reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: email,
      accessToken,
      clientId,
      clientSecret,
      refreshToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as nodemailer.TransportOptions); // 👈 CAST here

  return transporter;
};

export default createTransporter;
