/**
 * Judge task
 * Every file is resolved into id
 */
export interface IJudgeTask {
    solutionID: string;
    solutionFiles: string[];
    problemFiles: string[];
    data?: any;
}
