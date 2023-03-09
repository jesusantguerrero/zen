const integrations = require("./index");
const { default: config } = require("../../config")
const admin = require('firebase-admin');
const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

exports.parseRequestData = (data) => {
    return {
        "grant_type": "authorization_code",
        "client_id": config.integrations.google.clientId,
        "client_secret": config.integrations.google.clientSecret,
        "redirect_uri": config.integrations.google.redirectURI,
        "code": data.code,
        "refresh_token": data.refreshToken
    }
}

const isExpired = (updatedAt, expiresIn) => {
    const now = admin.firestore.Timestamp.now().toMillis();
    const expiresAt = updatedAt.toMillis() + expiresIn * 1000;

    return now > expiresAt
}

const sheetsRequest = async (url, serviceConnection, method = 'get', data) => {
    const { expires_in, refresh_token, access_token } = serviceConnection.accessToken;

    let accessToken = access_token;
    if (!serviceConnection.updated_at || isExpired(serviceConnection.updated_at, expires_in)) {
       const { data, error } = await integrations.requestAccess(TOKEN_ENDPOINT, {
            grant_type: 'refresh_token',
            client_id: config.integrations.google.clientId,
            client_secret: config.integrations.google.clientSecret,
            refresh_token: refresh_token
       });

        if (error) {
           return null
        }

        await integrations.updateConnection(serviceConnection.uid, { accessToken: data })
        accessToken = data.access_token;
    }

    return axios({
        method,
        url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        },
        data,
    }).catch((error) => {
        return null
    })
}

exports.appendToSheet = (_data, serviceConnection, service) => {
    return sheetsRequest(
        service.list_url, 
        serviceConnection,
        'post',
        {
            spreadsheetId: _data.spreadsheetId,
            range: _data.range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
              values: _data.values,
            },
        }
    )
}



