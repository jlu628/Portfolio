const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const dbPath = path.join(__dirname, './Comments.db')
const { hash, getTime, getTimeDisplayed } = require(path.join(__dirname, "./utils"));
let new_content = false;
const fs = require("fs");
let blogs = JSON.parse(fs.readFileSync(path.join(__dirname, "./content.json")));

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
    }
    await db.close();
    return res;
}

const insertBlog = async(blogID) => {
    await sqliteExec(`INSERT INTO blog (blogID) VALUES("${blogID}")`);
    new_content = true;
}

const insertIntoComment = async(blogID, commentID, comment) => {
    blogID = blogID ? blogID : "others"
    let name = comment.name.replaceAll(`"`, `''`);
    let content = comment.content.replaceAll(`"`, `''`);
    let link = comment.link ? comment.link.replaceAll(`"`, `''`) : "";
    let reply_to = comment.reply_to;
    let sectionIndex;
    if (!reply_to) {
        sectionIndex = `(SELECT IFNULL(max(sectionIndex) + 1, 0) as sectionIndex FROM comment WHERE blogID = "${blogID}")`
        reply_to = null;
    } else {
        reply_to = `"${reply_to}"`;
        sectionIndex = `(SELECT sectionIndex FROM comment WHERE commentID = ${reply_to} AND blogID = "${blogID}")`
    }

    await sqliteExec(
        `INSERT INTO comment (commentID, name, content, link, time, reply_to, blogID, sectionIndex) 
        VALUES(
            "${commentID}", 
            "${name}",
            "${content}", 
            "${link}",
            ${comment.time},
            ${reply_to},
            "${blogID}",
            ${sectionIndex})`
    );
    new_content = true;
}

const queryBlogIDs = async() => {
    let blogIDs = await sqliteGet(`SELECT blogID FROM blog`);
    blogIDs = blogIDs.map(b => b.blogID);
    return blogIDs;
}

const queryBlogComments = async(blogID) => {
    let blogComments = await sqliteGet(`
        SELECT commentID, name, content, link, time, reply_to, sectionIndex FROM comment
        WHERE blogID = "${blogID}" ORDER BY sectionIndex, time;
        `);
    let blogCommentsFormated = [];
    blogComments.forEach(comment => {
        if (comment.sectionIndex == blogCommentsFormated.length) {
            blogCommentsFormated.push({});
        }
        blogCommentsFormated[comment.sectionIndex][comment.commentId] = {
            name: comment.name.replaceAll(`''`, `"`),
            content: comment.content.replaceAll(`''`, `"`),
            link: comment.link.replaceAll(`''`, `"`),
            time: comment.time,
            reply_to: comment.reply_to
        }
    });
    return blogCommentsFormated;
}

// APIs
const getBlogComments = async(req, res) => {
    const blogID = req.body.blogID;
    let blogComments = await queryBlogComments(blogID);

    res.write(JSON.stringify({
        comments: blogComments
    }));
    res.end();
}

const getAllComments = async(req, res) => {
    let blogIDs = await queryBlogIDs();
    let comments = [];
    for (let i = 0; i < blogIDs.length; i++) {
        let blogComments = await queryBlogComments(blogIDs[i]);
        blogComments = [...blogComments].map(comment => ({
            title: blogs[blogIDs[i]] ? blogs[blogIDs[i]].title : null,
            blogID : blogIDs[i],
            sectionComment: comment
        }));
        comments = comments.concat(blogComments)
    }

    res.write(JSON.stringify({
        comments: comments
    }));
    res.end();
}

const writeComment = async(req, res) => {
    let blogID = req.body.blogID ? req.body.blogID : "others";
    let name = req.body.name;
    let content = req.body.content;
    let link = req.body.link;
    let reply_to = req.body.reply_to;
    let time = getTime();
    let msg = {};

    if (!name || !content) {
        msg.success = false;
        msg.err = "Name and content must not be empty";
    } else {
        try {
            await insertIntoComment(blogID, hash(name + content + time), {
                name: name,
                content: content,
                link: link,
                time: time,
                reply_to: reply_to
            });
            msg.success = true;
        } catch (err) {
            msg.success = false;
            msg.err = err.toString();
        }
    }

    res.write(JSON.stringify(msg));
    res.end();
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
    await db.exec(`DROP TABLE IF EXISTS blog`);

    const blogSchema = `CREATE TABLE IF NOT EXISTS blog (
        blogID VARCHAR(43) NOT NULL PRIMARY KEY
    )
    `
    await db.exec(blogSchema);

    const commentSchema = `CREATE TABLE IF NOT EXISTS comment (
        commentId VARCHAR(43) NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        link TEXT,
        time INTEGER NOT NULL,
        reply_to VARCHAR(43),
        blogID VARCHAR(43) NOT NULL,
        sectionIndex INTEGER NOT NULL,

        CONSTRAINT fk_reply_to FOREIGN KEY(reply_to) REFERENCES comment(commentId) ON DELETE SET NULL,
        CONSTRAINT fk_blog_id FOREIGN KEY(blogID) REFERENCES blog(blogID) ON DELETE CASCADE
    )`;
    await db.exec(commentSchema);

    await db.close(err => console.log(err));
}

// Load database from existing json files
const loadFromJSON = async(url) => {
    await reset();

    const commentsJSON = JSON.parse(fs.readFileSync(url));

    for (let blogID in commentsJSON) {
        await insertBlog(blogID);
        let sectionComments = commentsJSON[blogID];
        for (let sectionIndex = 0; sectionIndex < sectionComments.length; sectionIndex++) {
            let section = sectionComments[sectionIndex];
            for (let commentID in section) {
                let comment = section[commentID];
                await insertIntoComment(blogID, commentID, comment);
            }
        }
    }
}

// Export current database to json file
const exportToJson = async(url) => {
    let output = {};
    const blogIDs = await queryBlogIDs();
    for (let i = 0; i < blogIDs.length; i++) {
        let blogID = blogIDs[i];
        let blogComments = await queryBlogComments(blogID);
        output[blogID] = blogComments;
    }
    fs.writeFileSync(url, JSON.stringify(output));
    let size = (fs.statSync(url).size / 1024 / 1024).toFixed(3);
    console.log(`${getTimeDisplayed()}: comments data (${size} MB) saved to backup file`);
}

// Data backup daemon
{
    let wakeupinterval = 10 * 60 * 1000;
    setInterval(() => {
        if (new_content) {
            exportToJson(path.join(__dirname, "./commentsCopy.json"));
        }
        new_content = false;
    }, wakeupinterval);
}

exports.getBlogComments = getBlogComments;
exports.getAllComments = getAllComments;
exports.writeComment = writeComment;

// loadFromJSON("commentsData.json");
// exportToJson("./commentsCopy.json");