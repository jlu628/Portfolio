const sha256 = require("sha256");
const hash = (str) => {
    str = sha256(str);
    const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const add = (x, y, base) => {
        let z = [];
        const n = Math.max(x.length, y.length);
        let carry = 0;
        let i = 0;
        while (i < n || carry) {
            const xi = i < x.length ? x[i] : 0;
            const yi = i < y.length ? y[i] : 0;
            const zi = carry + xi + yi;
            z.push(zi % base);
            carry = Math.floor(zi / base);
            i++;
        }
        return z;
    }

    const multiplyByNumber = (num, x, base) => {
        if (num < 0) return null;
        if (num == 0) return [];

        let result = [];
        let power = x;
        while (true) {
            num & 1 && (result = add(result, power, base));
            num = num >> 1;
            if (num === 0) break;
            power = add(power, power, base);
        }

        return result;
    }

    const parseToDigitsArray = (str) => {
        const digits = str.split('');
        let arr = [];
        for (let i = digits.length - 1; i >= 0; i--) {
            const n = DIGITS.indexOf(digits[i])
            if (n == -1) return null;
            arr.push(n);
        }
        return arr;
    }

    const digits = parseToDigitsArray(str);
    if (digits === null) return null;

    let outArray = [];
    let power = [1];
    for (let i = 0; i < digits.length; i++) {
        digits[i] && (outArray = add(outArray, multiplyByNumber(digits[i], power, 62), 62));
        power = multiplyByNumber(16, power, 62);
    }

    let out = '';
    for (let i = outArray.length - 1; i >= 0; i--)
        out += DIGITS[outArray[i]];

    return out;
}

const getTimeAsync = async() => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    await new Promise(r => setTimeout(r, 1000));
    return parseInt([
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(""));
};

const getTime = () => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    return parseInt([
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(""));
};

const getTimeDisplayed = () => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),].join("-") + " " + 
        [padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(":");
};

const removeHTMLTags = (str) => {
    let regex = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
    return str.replace(regex, '');
}

const encodeDbString = (str, defaultValue) => {
    return str && str.trim() ? `"${str.replaceAll(`"`,`''`).replaceAll("\n","<br>")}"` : (typeof defaultValue === 'undefined' ? `""` : defaultValue);
}

const decodeDbString = (str, defaultValue) => {
    return str && str.trim() ? str.replaceAll(`''`,`"`) : (typeof defaultValue === 'undefined' ? null : defaultValue);
}

const decodeDbStringBR = (str, defaultValue) => {
    return str && str.trim() ? str.replaceAll(`''`,`"`) : (typeof defaultValue === 'undefined' ? null : defaultValue);
}

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const dbPath = path.join(__dirname, './database/database.db')
const sqliteExec = async(sql) => {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await db.get("PRAGMA foreign_keys = ON");

    try {
        await db.exec(sql);
    } catch (err) {
        console.log(sql)
        console.log(err);
        await db.close();
        throw err;
    }
    await db.close();
}

const sqliteGet = async(sql) => {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await db.get("PRAGMA foreign_keys = ON");

    let res;
    try {
        res = await db.all(sql);
    } catch (err) {
        console.log(err);
        await db.close();
        throw err;
    }
    await db.close();
    return res;
}

// Reset database and create schemas
const reset = async() => {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await db.get("PRAGMA foreign_keys = ON");

    // Drop tables
    await db.exec(`DROP TABLE IF EXISTS comment`);
    await db.exec(`DROP TABLE IF EXISTS blog_content`);
    await db.exec(`DROP TABLE IF EXISTS blog`);
    await db.exec(`DROP TABLE IF EXISTS project`);
    await db.exec(`DROP TABLE IF EXISTS password`);

    const blogSchema = `CREATE TABLE IF NOT EXISTS blog (
        blogID VARCHAR(43) NOT NULL PRIMARY KEY,
        title TEXT NOT NULL,
        date INTEGER NOT NULL,
        datealt TEXT NOT NULL,
        name TEXT NOT NULL,
        summary TEXT NOT NULL,
        brief TEXT NOT NULL,
        tags TEXT NOT NULL
    )
    `
    await db.exec(blogSchema);

    const blogContentSchema = `CREATE TABLE IF NOT EXISTS blog_content (
        blogID VARCHAR(43) NOT NULL,
        paragraphIdx INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        source TEXT NOT NULL,
        styles TEXT,

        PRIMARY KEY (blogID, paragraphIdx),
        CONSTRAINT blog_content_fk_blog_id FOREIGN KEY(blogID) REFERENCES blog(blogID) ON DELETE CASCADE ON UPDATE CASCADE
    )
    `
    await db.exec(blogContentSchema);

    const commentSchema = `CREATE TABLE IF NOT EXISTS comment (
        commentID VARCHAR(43) NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        link TEXT,
        time INTEGER NOT NULL,
        reply_to VARCHAR(43),
        blogID VARCHAR(43),
        sectionIndex INTEGER NOT NULL,

        CONSTRAINT comment_fk_reply_to FOREIGN KEY(reply_to) REFERENCES comment(commentId) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT comment_fk_blog_id FOREIGN KEY(blogID) REFERENCES blog(blogID) ON DELETE CASCADE ON UPDATE CASCADE
    )`;
    await db.exec(commentSchema);

    const projectSchema = `CREATE TABLE IF NOT EXISTS project (
        title TEXT NOT NULL,
        date INTEGER NOT NULL,
        thumbnail TEXT NOT NULL,
        dates TEXT NOT NULL,
        skills TEXT NOT NULL,
        description TEXT NOT NULL,
        link TEXT NOT NULL,
        importance INTEGER NOT NULL,

        PRIMARY KEY(title, date)
    )`;
    await db.exec(projectSchema);

    const passwordSchema = `CREATE TABLE IF NOT EXISTS password (
        role VARCHAR(10) NOT NULL,
        password VARCHAR(43) NOT NULL
    )`
    await db.exec(passwordSchema);

    await db.close(err => console.log(err));
}

const setup = async() => {
    const { loadProjectFromJSON } = require(path.join(__dirname, "./project.js"));
    const { loadCommentFromJSON } = require(path.join(__dirname, "./comment.js"));
    const { loadBlogFromJSON } = require(path.join(__dirname, "./blog.js"));
    const { loadPasswordFromJSON } = require(path.join(__dirname, "./admin.js"))

    await reset();
    await loadBlogFromJSON();
    await loadCommentFromJSON();
    await loadProjectFromJSON();
    await loadPasswordFromJSON();
}

exports.hash = hash;
exports.getTime = getTime;
exports.getTimeAsync = getTimeAsync
exports.getTimeDisplayed = getTimeDisplayed;

exports.removeHTMLTags = removeHTMLTags;

exports.encodeDbString = encodeDbString;
exports.decodeDbString = decodeDbString;
exports.decodeDbStringBR = decodeDbStringBR;
exports.sqliteExec = sqliteExec;
exports.sqliteGet = sqliteGet;

exports.setup = setup;