const constants = require('./constants');
const nodemailer = require('nodemailer');

class Email {
  constructor() {
    this.transporter = nodemailer.createTransport(constants.nodemailer);
  }

  async post(recipients) {
    return null; //await this.transporter.sendMail(recipients);
  }
}

module.exports = Email;