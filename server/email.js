class Email {
  constructor(transporter) {
    this.transporter =  transporter;
  }

  post(recipients) {
    return this.transporter.sendMail(recipients);
  }
}

module.exports = Email;