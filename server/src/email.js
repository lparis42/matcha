const constants = require('./constants');
const nodemailer = require('nodemailer');

class Email {
  constructor() {
    this.transporter = nodemailer.createTransport(constants.nodemailer);
  }

  async post(recipients) {
    try {
      return await this.transporter.sendMail(recipients);
    } catch (error) {
      console.error(error);
      throw error; // re-throw the error so it can be handled elsewhere
    }
  }
}

module.exports = Email;