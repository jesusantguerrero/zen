import { TaskApi } from '@/domain/matrix/repo/taskApi';
import { ITask } from '@/utils/useTaskFirestore';
import axios from 'axios';

const apiEndpoint = "/tasks";

export class taskService implements TaskApi {
    getMatrix(matrix: string): Promise<ITask[]> {
        return fetch("").then(result => result.json())    
    }

    deleteTask(taskUid: string): Promise<void> {
        return axios.delete(`${apiEndpoint}/${taskUid}`, )
    }


}