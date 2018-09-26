import { createTransport } from "nodemailer";
import { config } from "./config";

export const transport = config.mail.enabled ? createTransport(config.mail.options) : null;
export const sendMail = async (to: string, subject: string, html: string) => {
    if (!transport) { throw new Error("Mail error"); }
    return new Promise<any>((resolve, reject) => {
        transport.sendMail({ from: config.mail.from, to, subject, html }, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};
