export const ensureElement = <T>(arr: T[], element: T) => {
    if (!arr.includes(element)) {
        arr.push(element);
    }
};
