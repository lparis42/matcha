const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

class Email {
  constructor() {
    console.log('Initializing OAuth2 Client with:');

    this.oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // Définir les informations d'authentification avec le refresh token
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    // Initialiser le transporteur de mail
    this.initializeTransporter().then(async () => {
      // Envoi d'un email de test
      console.log('Sending test email...');
      const recipients = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: 'Test email',
        text: 'This is a test email.'
      };

      try {
        const info = await this.transporter.sendMail(recipients);
        console.log('Email sent: (' + info.response + ') to ' + recipients.to);
      } catch (error) {
        console.error('Error sending email:', error.response);
      }
    });
  }

  async initializeTransporter() {
    try {
      // Obtenir un access token à partir du refresh token
      const accessToken = (await this.oAuth2Client.getAccessToken()).token;

      // console.log('GMAIL_USER:', process.env.GMAIL_USER);
      // console.log('ACCESS_TOKEN:', accessToken);
      // console.log('CLIENT_ID:', process.env.CLIENT_ID);
      // console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
      // console.log('REDIRECT_URI:', process.env.REDIRECT_URI);
      // console.log('REFRESH_TOKEN:', process.env.REFRESH_TOKEN);

      // Création du transporteur nodemailer avec OAuth2
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

    } catch (error) {
      console.error('Error creating OAuth2 transporter:', error);
      throw error;
    }
  }

  async post(recipients) {
    return;
    try {
      const info = await this.transporter.sendMail(recipients);
      console.log('Email sent: (' + info.response + ') to ' + recipients.to);
    } catch (error) {
      console.error('Error sending email:', error.response);
    }
  }
}

module.exports = Email;
