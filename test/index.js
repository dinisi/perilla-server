"use strict";
const crypto_1 = require("crypto");
let getFuzzyTime = () => {
    const date = new Date();
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
};
let getVerificationCode = (accessToken, clientID) => {
    return crypto_1.pbkdf2Sync(`${accessToken}.${getFuzzyTime()}`, clientID, 1000, 64, "sha512").toString("hex");
};

const request = require('request');
const rs = require("randomstring");

const username = "Administrator";
const password = "IHFuf2cNcJ";
const rolename = "Administrators";
const clientID = "TEST";

(async () => {
    await new Promise((resolve) => {
        request.get(`http://127.0.0.1:3000/rolesof?username=${username}`, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            console.log(res.body);
            resolve();
        });
    });
    const accessToken = await new Promise((resolve) => {
        const loginPackage = {
            username: username,
            password: password,
            rolename: rolename,
            clientID: clientID,
        };
        request.post("http://127.0.0.1:3000/login", { form: loginPackage }, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            console.log(res.body);
            resolve(res.body);
        });
    });
    console.log(`v: ${getVerificationCode(accessToken, clientID)}`);
    // api/role/list
    await new Promise((resolve) => {
        request.get(`http://127.0.0.1:3000/api/role/list?v=${getVerificationCode(accessToken, clientID)}`, { headers: { authorization: accessToken } }, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            console.log(res.body);
        });
    });
})();
