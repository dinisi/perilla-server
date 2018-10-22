import { Document, DocumentQuery } from "mongoose";
import { Always, Array, Literal, Record, Static, String, Union } from "runtypes";

const IConditionType = Union(
    Literal("equals"),
    Literal("gte"),
    Literal("gt"),
    Literal("lt"),
    Literal("lte"),
);

export const IQueryCondition = Record({
    field: String,
    condition: Array(Record({
        type: IConditionType,
        value: Always,
    })),
});

export type IQueryCondition = Static<typeof IQueryCondition>;

const extend = <T extends Document>(origin: DocumentQuery<T[], T>, query: IQueryCondition) => {
    origin = origin.where(query.field);
    for (const condition of query.condition) {
        switch (condition.type) {
            case "equals":
                origin = origin.equals(condition.value);
                break;
            case "gte":
                origin = origin.gte(condition.value);
                break;
            case "gt":
                origin = origin.gt(condition.value);
                break;
            case "lte":
                origin = origin.lte(condition.value);
                break;
            case "lt":
                origin = origin.lt(condition.value);
                break;
        }
    }
    return origin;
};

export const extendQuery = <T extends Document>(origin: DocumentQuery<T[], T>, query: any) => {
    if (!query) { return origin; }
    query = JSON.parse(query);
    if (query instanceof Array) {
        for (const condition of query) {
            origin = extend(origin, condition);
        }
    } else {
        if (IQueryCondition.validate(query).success) {
            origin = extend(origin, query);
        } else {
            throw new Error("Invalid query");
        }
    }
    return origin;
};
