const { default: Config } = require("../../config/index")
const providers = require("./providers");

module.exports = class Mail {
    transporter = null;
    constructor() {
        this.transporter = providers[Config.mail.provider || 'sendgrid']
    }

    async send(email, subject, message) {
        const res = await this.transporter.send({
            from: Config.email.from || "jesusant@gmail.com",
            to: email,
            subject: subject,
            text: message,
        }).then(() => {
            console.log("Email sent to " + email);
        }).catch(err => {
            console.log("Error sending email to " + email);
            console.log(err);
        });

        return res;
    }
}