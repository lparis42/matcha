const nodemailer = require('nodemailer');

class Email {
  constructor() {
    const options = {
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      ignoreTLS: process.env.NODEMAILER_IGNORE_TLS === 'true',
    };
    this.transporter = nodemailer.createTransport(options);
  }

  async post(recipients) {
    return ; //await this.transporter.sendMail(recipients);
  }
}

module.exports = Email;