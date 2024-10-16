const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

class Email {
  constructor() {
    console.log('Initializing OAuth2 Client with:');

    //this.getTokensWithCode('');
    this.initializeTransporter();

  }

  async getTokensWithCode(code) {
    try {
      const data = querystring.stringify({
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const response = await axios.post(TOKEN_URL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error(error.response.data);
    }
  }

  async initializeTransporter() {

    try {
      this.oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
      );

      this.oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
      });

      const accessToken = (await this.oAuth2Client.getAccessToken()).token;

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      // console.log('Sending test email...');
      // const recipients = {
      //   from: process.env.GMAIL_USER,
      //   to: process.env.GMAIL_USER,
      //   subject: 'Test email',
      //   text: 'This is a test email.'
      // };
      // const info = await this.transporter.sendMail(recipients);
      // console.log('Email sent: (' + info.response + ') to ' + recipients.to);

    } catch (error) {
      console.error('Error creating OAuth2 transporter:', error);
      throw error;
    }
  }

  async post(recipients) {
    try {
      const info = await this.transporter.sendMail(recipients);
      console.log('Email sent: (' + info.response + ') to ' + recipients.to);
    } catch (error) {
      console.error('Error sending email:', error.response);
    }
  }

}

module.exports = Email;
