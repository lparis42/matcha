const nodemailer = require('nodemailer');
//const { google } = require('googleapis');
require('dotenv').config();

class Email {
  constructor() {

    // this.oAuth2Client = new google.auth.OAuth2(
    //   process.env.CLIENT_ID,
    //   process.env.CLIENT_SECRET,
    //   process.env.REDIRECT_URI);

    // this.oAuth2Client.setCredentials({
    //   refresh_token: process.env.REFRESH_TOKEN
    // });

    this.initializeTransporter().then(async () => {
      // await this.post({
      //   from: process.env.GMAIL_USER,
      //   to: process.env.GMAIL_USER,
      //   subject: 'Test email',
      //   text: 'Test email'
      // });
    });
  }

  async initializeTransporter() {
    try {
      //const accessToken = (await this.oAuth2Client.getAccessToken()).token;

      this.transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE,
        auth: {
          //type: 'OAuth2',
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS,
          // accessToken: accessToken,
          // clientId: process.env.CLIENT_ID,
          // clientSecret: process.env.CLIENT_SECRET,
          // refreshToken: process.env.REFRESH_TOKEN,
        },
      });

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
