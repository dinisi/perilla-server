import { createTransport } from "nodemailer";
import { config } from "./config";

export const transport = createTransport(config.mail.options);
export const sendMail = async (to: string, subject: string, html: string) => {
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
