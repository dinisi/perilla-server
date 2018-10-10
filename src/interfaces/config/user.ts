export interface IConfiguration {
    createFile: boolean;
    createProblem: boolean;
    createSolution: boolean;
    createContest: boolean;
    manageSystem: boolean;
    minSolutionCreationInterval: number;
    [key: string]: boolean | number;
}
