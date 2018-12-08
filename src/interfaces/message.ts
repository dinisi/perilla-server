export enum IPCMessageType {
    FileGCRequest,
}

export interface IPCMessage {
    type: IPCMessageType;
    payload: any;
}
