export class ServerError {
    public message: string;
    public code: number;
    constructor(message: string, code: number = 500) {
        this.message = message;
        this.code = code;
    }
}
