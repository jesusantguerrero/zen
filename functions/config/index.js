const { config } = require("firebase-functions");

// Lazy read — functions.config() may not have `env` set in every environment
// (local dev, cold boots without runtime config). Build the shape on access so
// module load never crashes, and missing values surface only when actually used.
const get = (name) => {
    const env = (config() || {}).env || {};
    return env[name];
};

exports.default = {
    mail: {
        get host() { return get('email_host'); },
        get port() { return get('email_port'); },
        get user() { return get('email_username'); },
        get password() { return get('email_password'); },
        get from() { return get('email_from'); },
        provider: 'sendgrid',
    },
    get sendgridKey() { return get('sendgrid_key'); },
    integrations: {
        jira: {
            get clientId() { return get('jira_client_id'); },
            get clientSecret() { return get('jira_client_secret'); },
            get redirectURI() { return get('jira_redirect_uri'); },
        },
    },
};
