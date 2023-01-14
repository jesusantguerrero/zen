const sgMail = require('@sendgrid/mail')
const { default: Config } = require("../../../config/index")
sgMail.setApiKey(Config.sendgridKey)

class Sendgrid {
    constructor (options) {
        this.options = options
    }

    send (data) {
        return sgMail.send(data)
    }
}
module.exports = new Sendgrid;