const { config } = require("firebase-functions");

const { env } = config();
exports.default = {
    mail: {
        host: env.email_host,
        port: env.email_port,
        user: env.email_username,
        password: env.email_password,
        from: env.email_from,
        provider: 'sendgrid'
    },
    sendgridKey: env.sendgrid_key,
    integrations: {
        jira: {
            clientId: env.jira_client_id,
            clientSecret: env.jira_client_secret,
            redirectURI: env.jira_redirect_uri
        },
    }
}