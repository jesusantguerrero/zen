const { OAuth2Client } = require('google-auth-library');
const {default: config }= require("../../../config");
exports.exchangeCodeForAccess = async (code) => {
  const client = new OAuth2Client(
    config.integrations.google.clientId, 
    config.integrations.google.secret, 
    config.integrations.google.redirectUri
  );

  try {
    const { tokens } = await client.getToken(code);

    return tokens;
  } catch (error) {
    console.error('Error exchanging code for access token:', error);
    return null;
  }
}
