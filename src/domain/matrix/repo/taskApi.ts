import { ITask } from "@/plugins/useTaskFirestore";

export interface TaskApi {
    saveTask(taskForm: Partial<ITask>): Promise<ITask>,
    updateTask(taskForm: Partial<ITask>): Promise<ITask>,
    updateTaskBatch(taskForm: Partial<ITask>[]): Promise<ITask>,
    deleteTask(taskUid: string): Promise<void>,
    getTaskByMatrix(matrix: string): Promise<ITask[]>,
    getTaskByType(type: string): Promise<ITask>,
    getUncommittedTasks(): Promise<ITask[]>,
    getCommittedTasks(): Promise<ITask[]>,
    getAllFromUser(userUid: string): Promise<ITask[]>,
    saveTaskBatch(taskForm: Partial<ITask>[]): Promise<ITask[]>,
    getMatrix(matrix: string): Promise<ITask[]>,
    getTaskById(taskUid: string): Promise<ITask>
}