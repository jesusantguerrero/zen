import { functions } from "../../plugins/useFirebase";
const getIntegrations = functions.httpsCallable("getServiceResources");


export const parseGithubResource = (jiraIssue, matrixData = {}) => {
    return {
        type: 'JIRA_ISSUES',
        source: 'jira',
        source_id: jiraIssue.id,
        source_key: jiraIssue.key,
        source_item_link: jiraIssue.self,
        title: jiraIssue.fields.summary,
        description: jiraIssue.renderedFields?.description || jiraIssue.fields.description,
        due_date: "",
        duration: "",
        matrix: matrixData.matrix || 'backlog',
        tags: matrixData.tags || [],
        contacts: matrixData.contacts || [],
        order: 0,
        duration_ms: 0,
        done: false,
        checklist: jiraIssue.subtasks ? 
        jiraIssue.subtasks.map((subtask, index) => ({
            source_item_link: subtask.self,
            source_id: subtask.id,
            source_key: subtask.key,
            title: jiraIssue.fields.summary,
            done: jiraIssue.fields.status.name === 'Done',
            order: index
        })) : [],
        tracks: [],
    }
}

export const getSites = async (integration) => {
    let data = null;
    let error = null;

    await getIntegrations({
        connectionUid: integration.uid,
        service: integration.service,
        type: 'list'
    }).then((response) => {
        data = response.data;
    }).catch((error) => {
        error = error.message;
    }
    );
    return {
        data,
        error
    }
};

export const getProjects = async (integration, cloud) => {
    let data = null;
    let error = null;
    await getIntegrations({
        connectionUid: integration.uid,
        service: integration.service,
        cloudId: cloud.login || cloud.id, 
        type: 'projects'
    }).then((response) => {
        data = response.data.values;
    }).catch((error) => {
        error = error.message;
    });

    return { data, error };
};

export const getIssues = async (integration, cloudId, projectId, type = 'prs') => {
    let data = null;
    let error = null;
    await getIntegrations({
        connectionUid: integration.uid,
        service: integration.service,
        cloudId: cloudId,
        project: projectId, 
        type,
    }).then((response) => {
        data = response.data.issues;
    }).catch((error) => {
        error = error.message;
    })

    return { data, error }
};