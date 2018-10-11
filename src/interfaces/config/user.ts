import { Boolean, Number, Record, Static } from "runtypes";

export const IConfiguration = Record(
    {
        createFile: Boolean,
        createProblem: Boolean,
        createSolution: Boolean,
        createContest: Boolean,
        manageSystem: Boolean,
        minSolutionCreationInterval: Number,
    },
);

export interface IConfiguration extends Static<typeof IConfiguration> {
    [key: string]: boolean | number;
}
