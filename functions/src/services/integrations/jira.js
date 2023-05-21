const integrations = require("./index");
const { default: config } = require("../../../config")
const admin = require('firebase-admin');
const axios = require('axios');
const TOKEN_ENDPOINT = "https://auth.atlassian.com/oauth/token";
const PROJECTS_ENDPOINT = "https://api.atlassian.com/ex/jira/:cloudId:/rest/api/3/project/search";
const ISSUES_ENDPOINT = "https://api.atlassian.com/ex/jira/:cloudId:/rest/api/3/search"

exports.parseRequestData = (data) => {
    return {
        "grant_type": "authorization_code",
        "client_id": config.integrations.jira.clientId,
        "client_secret": config.integrations.jira.clientSecret,
        "redirect_uri": config.integrations.jira.redirectURI,
        "code": data.code,
        "refresh_token": data.refreshToken
    }
}

const isExpired = (updatedAt, expiresIn) => {
    const now = admin.firestore.Timestamp.now().toMillis();
    const expiresAt = updatedAt.toMillis() + expiresIn * 1000;

    return now > expiresAt
}

const jiraRequest = async (url, serviceConnection, method = 'get', data) => {
    const { expires_in, refresh_token, access_token } = serviceConnection.accessToken;

    let accessToken = access_token;
    if (!serviceConnection.updated_at || isExpired(serviceConnection.updated_at, expires_in)) {
       const { data, error } = await integrations.requestAccess(TOKEN_ENDPOINT, {
            grant_type: 'refresh_token',
            client_id: config.integrations.jira.clientId,
            client_secret: config.integrations.jira.clientSecret,
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

exports.getList = (_data, serviceConnection, service) => {
    return jiraRequest(service.list_url, serviceConnection)
}

exports.getProjects = (data, serviceConnection) => {
    const url = PROJECTS_ENDPOINT.replace(':cloudId:', data.cloudId);
    
    return jiraRequest(url, serviceConnection)
}

exports.getIssues = (data, serviceConnection) => {
    const jql = data.jql ? data.jql : `project = ${data.project} and (Sprint in openSprints() and Sprint not in closedSprints() and Sprint not in futureSprints()) and assignee = currentUser()`
    const url = `${ISSUES_ENDPOINT}?jql=${jql}&expand=renderedFields`.replace(":cloudId:", data.cloudId);

    return jiraRequest(url, serviceConnection)
}

exports.pickIssue = (data, serviceConnection) => {
    // todo: implement
    const jql = `project = ${data.project} and (Sprint in openSprints() and Sprint not in closedSprints() and Sprint not in futureSprints()) and assignee = currentUser()`
    const url = `${ISSUES_ENDPOINT}?jql=${jql}`.replace(":cloudId:", data.cloudId);

    return jiraRequest(url, serviceConnection)
}

exports.addWebhook = (data, serviceConnection) => {
    const url = '/';
    return jiraRequest(url, serviceConnection, 'post', data)
}

exports.extendWebhooks = (data, serviceConnection) => {
    // todo: add webhooks
    const url = '/';
    return jiraRequest(url, serviceConnection, 'post', data)
}