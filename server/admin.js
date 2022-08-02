const path = require("path");
const { hash, sqliteExec, sqliteGet, encodeDbString, decodeDbString } = require(path.join(__dirname, "./utils"));
const { exportBlogToJSON } = require(path.join(__dirname, "blog.js"));
const { exportCommentToJSON } = require(path.join(__dirname, "comment.js"));
const { exportProjectToJSON } = require(path.join(__dirname, "project.js"));

const fs = require('fs');
const tokenCache = {};

const generateToken = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    let token = "";
    for (let i = 0; i < 64; i++) {
        token += pick(chars);
    }
    return token;
}

const login = async (req, res) => {
    const password = req.body.password;
    msg = {};
    if (hash(password) == (await sqliteGet(`SELECT password FROM password WHERE role = "admin"`))[0].password) {
        msg.success = true;
        msg.token = generateToken();
        tokenCache[msg.token] = new Date();
        msg.managedData = await getAdminManagedData();
    } else {
        msg.success = false;
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const verify = async (req, res) => {
    const token = req.body.token;
    const msg = {};
    if (tokenCache[token] && new Date() - tokenCache[token] <= 60 * 60 * 1000) {
        msg.success = true;
        msg.managedData = await getAdminManagedData();
        tokenCache[token] = new Date();
    } else {
        msg.success = false;
        delete tokenCache[token];
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const getAdminManagedData = async () => {
    const projects = await exportProjectToJSON();
    const comments = await exportCommentToJSON();
    const blogs = await exportBlogToJSON();

    return {
        blogs: blogs,
        projects: projects,
        comments: comments
    }
}

const loadPasswordFromJSON = async () => {
    const password = JSON.parse(fs.readFileSync(path.join(__dirname, "./database/backup/password.json"))).admin;
    await sqliteExec(`INSERT INTO password (role, password) VALUES ("admin", "${password}")`);
}

exports.loadPasswordFromJSON = loadPasswordFromJSON;

exports.login = login;
exports.verify = verify;