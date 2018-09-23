export interface IConfiguration {
    createFile: boolean;
    createProblem: boolean;
    createSolution: boolean;
    manageSystem: boolean;
    minSolutionCreationInterval: number;
    [key: string]: boolean | number;
}

export const worst: IConfiguration = {
    createFile: false,
    createProblem: false,
    createSolution: false,
    manageSystem: false,
    minSolutionCreationInterval: 10000,
};

export const best: IConfiguration = {
    createFile: true,
    createProblem: true,
    createSolution: true,
    manageSystem: true,
    minSolutionCreationInterval: 0,
};
