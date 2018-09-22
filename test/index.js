"use strict";
const crypto_1 = require("crypto");
const getFuzzyTime = () => {
    const date = new Date();
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
};
const getVerificationCode = (accessToken, clientID) => {
    return crypto_1.pbkdf2Sync(`${accessToken}.${getFuzzyTime()}`, clientID, 1000, 64, "sha512").toString("hex");
};

const request = require('request');
const rs = require("randomstring");

const config = require("./config");
let accessToken = config.accessToken || null;
const v = () => {
    return getVerificationCode(accessToken, config.clientID);
};

(async () => {
    if (!accessToken) {
        accessToken = await new Promise((resolve) => {
            const loginPackage = {
                username: config.username,
                password: config.password,
                clientID: config.clientID,
            };
            request.post("http://127.0.0.1:3000/login", { form: loginPackage }, (err, res) => {
                if (err) {
                    console.error(err);
                    process.exit(0);
                }
                console.log(`[${res.statusCode}]`);
                const result = JSON.parse(res.body);
                console.log(result);
                resolve(result.payload);
            });
        });
    }
    console.log(`AccessToken: ${accessToken}`);
    console.log(`v: ${v()}`);
    // Fetch problems
    await new Promise((resolve) => {
        const query = {
            v: v(),
            a: accessToken,
            skip: 0,
            limit: 128
        };
        request.get("http://127.0.0.1:3000/api/problem/list", { qs: query }, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            const result = JSON.parse(res.body);
            console.log(result);
            resolve(result.payload);
        });
    });
    // Fetch solutions
    await new Promise((resolve) => {
        const query = {
            v: v(),
            a: accessToken,
            skip: 0,
            limit: 128
        };
        request.get("http://127.0.0.1:3000/api/file/list", { qs: query }, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            const result = JSON.parse(res.body);
            console.log(result);
            resolve(result.payload);
        });
    });
    await new Promise((resolve) => {
        const query = {
            v: v(),
            a: accessToken,
            skip: 0,
            limit: 128
        };
        request.get("http://127.0.0.1:3000/api/solution/list", { qs: query }, (err, res) => {
            if (err) {
                console.error(err);
                process.exit(0);
            }
            console.log(`[${res.statusCode}]`);
            const result = JSON.parse(res.body);
            console.log(result);
            resolve(result.payload);
        });
    });
})();
