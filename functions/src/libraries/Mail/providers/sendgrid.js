const sgMail = require('@sendgrid/mail')
const { default: Config } = require("../../../../config/index")

// Guard setApiKey — it throws synchronously if the key is undefined or
// missing the "SG." prefix, which would break function-container cold-start
// in environments where the key isn't configured.
let keyConfigured = false
const ensureKey = () => {
    if (keyConfigured) return
    const key = Config.sendgridKey
    if (typeof key === 'string' && key.startsWith('SG.')) {
        sgMail.setApiKey(key)
        keyConfigured = true
    }
}

class Sendgrid {
    constructor (options) {
        this.options = options
    }

    send (data) {
        ensureKey()
        if (!keyConfigured) {
            return Promise.reject(new Error('SendGrid API key not configured (functions.config().env.sendgrid_key)'))
        }
        return sgMail.send(data)
    }
}
module.exports = new Sendgrid;
