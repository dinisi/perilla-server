export class ServerError {
    message: string;
    code: number;
    constructor(message: string, code: number = 500) {
        this.message = message;
        this.code = code;
    }
}