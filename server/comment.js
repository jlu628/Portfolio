const path = require("path");
const { hash, getTime, sqliteExec, sqliteGet, encodeDbString, decodeDbString, decodeDbStringBR } = require(path.join(__dirname, "./utils"));
let newCommentContent = false;

// Change comment from the format stored in JSON backup file to the format stored in database
const encodeComment = (comment) => {
    comment.name = encodeDbString(comment.name);
    comment.content = encodeDbString(comment.content);
    comment.link = encodeDbString(comment.link, `""`);
    comment.reply_to = encodeDbString(comment.reply_to, "null");
    comment.blogID = comment.blogID == "others" ? "null" : `"${comment.blogID}"`;
}

// Change comment from the format stored in database to the format stored in JSON backup file
const decodeComment = (comment) => {
    comment.name = decodeDbString(comment.name);
    comment.content = decodeDbStringBR(comment.content);
    comment.link = decodeDbString(comment.link);
    comment.reply_to = decodeDbString(comment.reply_to);
    comment.blogID = comment.blogID ? comment.blogID : "others";
}

// Insert comment into database
const insertComment = async (comment) => {
    encodeComment(comment);
    const { commentID, name, content, link, time, reply_to, blogID } = comment;
    let sectionIndex;
    if (reply_to == "null") {
        if (blogID == "null") {
            sectionIndex = `(SELECT IFNULL(max(sectionIndex) + 1, 0) as sectionIndex FROM comment WHERE blogID IS NULL)`
        } else {
            sectionIndex = `(SELECT IFNULL(max(sectionIndex) + 1, 0) as sectionIndex FROM comment WHERE blogID = ${blogID})`
        }
    } else {
        sectionIndex = `(SELECT sectionIndex FROM comment WHERE commentID = ${reply_to})`
    }
    await sqliteExec(
        `INSERT INTO comment (commentID, name, content, link, time, reply_to, blogID, sectionIndex) 
        VALUES(
            "${commentID}",
            ${name},
            ${content},
            ${link},
            ${time},
            ${reply_to},
            ${blogID},
            ${sectionIndex}
        )`
    );
    newCommentContent = true;
}

// Get the comment that belong to a specified blog
const queryBlogComment = async (blogID) => {
    let comments = await sqliteGet(`SELECT * FROM comment WHERE blogID = "${blogID}" ORDER BY sectionIndex ASC, time ASC`);
    let output = [];
    let sectionIndex = -1;
    for (let comment of comments) {
        decodeComment(comment);
        if (comment.sectionIndex > sectionIndex) {
            output.push([]);
            sectionIndex++;
        }
        output[sectionIndex].push({
            commentID: comment.commentID,
            name: comment.name,
            content: comment.content,
            link: comment.link,
            reply_to: comment.reply_to,
            time: comment.time
        });
    }
    return output;
}

// Get all comments
const queryAllComments = async () => {
    let comments = await sqliteGet(`SELECT * FROM comment ORDER BY BlogID, sectionIndex ASC, time ASC`);
    let output = {};
    let blogID = "";
    let sectionIndex = -1;
    for (let comment of comments) {
        decodeComment(comment);
        if (blogID != comment.blogID) {
            blogID = comment.blogID;
            output[blogID] = [];
            sectionIndex = -1;
        }
        if (comment.sectionIndex > sectionIndex) {
            output[blogID].push([]);
            sectionIndex++;
        }
        output[blogID][sectionIndex].push({
            commentID: comment.commentID,
            name: comment.name,
            content: comment.content,
            link: comment.link,
            reply_to: comment.reply_to,
            time: comment.time
        });
    }
    return output;
}

// Edit comments
const editCommentDB = async (oldCommentID, comment) => {
    encodeComment(comment);
    const { name, content, link, reply_to, blogID } = comment;
    const setName = `name = ${name}`;
    const setContent = `content = ${content}`;
    const setLink = `link = ${link}`;
    const setReply = `relpy_to = ${reply_to}`;
    const setBlogID = `blogID = ${blogID}`;
    const setAttributes = [setName, setContent, setLink, setReply, setBlogID].join(", ");
    await sqliteExec(
        `UPDATE blog SET 
        ${setAttributes} 
        WHERE commentID = "${oldCommentID}"`
    );
    newCommentContent = true;
}

// Delete comment
const deleteCommentDB = async (commentID) => {
    await sqliteExec(
        `DELETE FROM comment WHERE commentID = "${commentID}"`
    );
    newCommentContent = true;
}

// APIs
const addComment = async (req, res) => {
    const { comment } = req.body;
    const { name, content, link, blogID } = comment;
    let msg = {success: false, error: null};
    try {
        let isString = (value) => typeof value === 'string' || value instanceof String;
        if (!(name && content && blogID)) {
            msg.success = false;
            msg.error = "Form not complete";
        } else if (!(isString(name) && isString(content) && isString(blogID))) {
            msg.success = false;
            msg.error = "Wrong format";
        } else if (link && !(isString(link) && (link.startsWith("https://") || link.startsWith("http://")))) {
            msg.success = false;
            msg.error = "Invalid link";
        } else {
            comment.time = getTime();
            comment.commentID = hash(name+content+comment.time);
            try {
                await insertComment(comment);
                msg.success = true;
            } catch (err) {
                msg.success = false;
                msg.error = "Database error";
            }
        }
    } catch (error) {
        console.log("\n" + getTimeDisplayed());
        console.log(error);
        console.log("\n")
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const editComment = async (req, res) => {
    const { comment, password } = req.body;
    const oldCommentID = req.body.commentID;
    const { name, content, link, blogID } = comment;
    let msg = {};

    if (!(name && content && blogID)) {
        msg.success = false;
        msg.error = "Form not complete";
    } else if (!(isString(name) && isString(content) && isString(blogID))) {
        msg.success = false;
        msg.error = "Wrong format";
    } else if (link && !(isString(link) && (link.startsWith("https://") || link.startsWith("http://")))) {
        msg.success = false;
        msg.error = "Invalid link";
    } else if (hash(password) != (await sqliteGet(`SELECT password FROM password WHERE role = "admin"`))[0].password) {
        msg.success = false;
        msg.error = "Wrong password";
    } else {
        try {
            await editCommentDB(oldCommentID, comment);
            msg.success = true;
        } catch (err) {
            msg.success = false;
            msg.error = "Database error"
        }
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const deleteComment = async (req, res) => {
    const { password, commentID } = req.body;
    if (hash(password) != (await sqliteGet(`SELECT password FROM password WHERE role = "admin"`))[0].password) {
        msg.success = false;
        msg.error = "Wrong password";
    } else {
        try {
            await deleteCommentDB(commentID);
            msg.success = true;
        } catch (err) {
            msg.success = false;
            msg.error = "Database error"
        }
    }
}

const getBlogComments = async (req, res) => {
    let blogID = req.body.blogID;
    let msg = {data: null};
    try {
        let comments = await queryBlogComment(blogID);
        msg.data = comments;
    } catch (error) {
        console.log("\n" + getTimeDisplayed());
        console.log(error);
        console.log("\n")
    }
    res.write(JSON.stringify(msg));
    res.end();
}

// Insert initial data to database
const loadCommentFromJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/comment.json");
    const fs = require("fs");

    const comments = JSON.parse(fs.readFileSync(backupPath));
    for (let blogID in comments) {
        for (let sections of comments[blogID]) {
            for (let comment of sections) {
                comment.blogID = blogID;
                await insertComment(comment);
            }
        }
    }
}

// Backup database information to JSON
const exportCommentToJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/comment.json");
    const fs = require("fs");

    let comments = await queryAllComments();
    fs.writeFileSync(backupPath, JSON.stringify(comments));
    return comments;
}

// Backup daemon
{
    let wakeupinterval = 1000;
    setInterval(() => {
        if (newCommentContent) {
            exportCommentToJSON();
        }
        newCommentContent = false;
    }, wakeupinterval);
}

// Internal usage
exports.loadCommentFromJSON =loadCommentFromJSON;
exports.exportCommentToJSON = exportCommentToJSON;

// Admin usage
exports.addComment = addComment;
exports.editComment = editComment;
exports.deleteComment = deleteComment;

// Public APIs
exports.getBlogComments = getBlogComments;