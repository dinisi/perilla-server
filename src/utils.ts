export const ensureElement = <T>(arr: T[], element: T) => {
    if (!arr.includes(element)) {
        arr.push(element);
    }
};

export const getBaseURL = (hostname: string, port: number) => {
    return "http://" + hostname + (port === 80 ? "" : ":" + port);
};
