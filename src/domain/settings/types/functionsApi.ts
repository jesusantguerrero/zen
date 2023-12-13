export interface RequestAccessParams {
    [key: string]: string;
    service: 'google' | 'jira' | 'github';
    userId: string;
}

export interface ServerFunctionsApi {
    requestAccess(params: RequestAccessParams): Promise<void>,
}