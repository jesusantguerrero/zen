import { RequestAccessParams,  ServerFunctionsApi } from '@/domain/settings/types/functionsApi';
import { functions } from "@/plugins/useFirebase";

export class functionsService implements ServerFunctionsApi {
    requestAccess(params: RequestAccessParams) {
        functions.httpsCallable('requestAccess')(paramas)
    }
}