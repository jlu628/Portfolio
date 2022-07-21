const path = require("path");
const { hash, sqliteExec, sqliteGet, encodeDbString, decodeDbString } = require(path.join(__dirname, "./utils"));
let newBlogContent = false;

// Change blog info from the format stored in JSON backup file to the format stored in database
const encodeBlog = (blog) => {
    blog.title = encodeDbString(blog.title);
    blog.datealt = encodeDbString(blog.datealt);
    blog.name = encodeDbString(blog.name);
    blog.summary = encodeDbString(blog.summary);
    blog.brief = encodeDbString(blog.brief ? blog.brief.join("\n") : null);
    blog.tags = encodeDbString(blog.tags ? blog.tags.join("\n") : null);
    if (!blog.content || !Array.isArray(blog.content)) {
        return blog.content = [];
    }
    blog.content.forEach((paragraph, index) => {
        paragraph.paragraphIdx = index;
        paragraph.source = encodeDbString(paragraph.source);
        paragraph.description = encodeDbString(paragraph.description);
        paragraph.type = encodeDbString(paragraph.type, "text");
    });
}

// Change blog info from the format stored in database to the format stored in JSON backup file
const decodeBlog = (blog) => {
    blog.title = decodeDbString(blog.title);
    blog.datealt = decodeDbString(blog.datealt);
    blog.name = decodeDbString(blog.name);
    blog.summary = decodeDbString(blog.summary);
    blog.brief = decodeDbString(blog.brief).split("\n");
    blog.tags = decodeDbString(blog.tags).split("\n");
    if (!blog.content || !Array.isArray(blog.content)) {
        blog.content = [];
        return;
    }
    blog.content.forEach((paragraph) => {
        delete paragraph.paragraphIdx;
        paragraph.source = decodeDbString(paragraph.source);
        paragraph.description = decodeDbString(paragraph.description);
    });
}

// Insert new blog into database
const insertIntoBlog = async (blog) => {
    encodeBlog(blog);
    // Insert blog info
    const { title, date, datealt, name, summary, brief, tags , content } = blog;
    const blogID = hash(name + date);
    await sqliteExec(
        `INSERT INTO blog (title, date, datealt, name, summary, brief, tags, blogID) 
        VALUES(
            ${title},
            ${date},
            ${datealt},
            ${name},
            ${summary},
            ${brief},
            ${tags},
            "${blogID}"
        )`
    );
    // Insert blog content
    for (let paragraphIdx = 0; paragraphIdx < content.length; paragraphIdx++) {
        const { type, source, description } = content[paragraphIdx];
        await sqliteExec(
            `INSERT INTO blog_content (paragraphIdx, type, source, description, blogID) 
            VALUES(
                ${paragraphIdx},
                ${type},
                ${source},
                ${description},
                "${blogID}"
            )`
        );
    }
    newBlogContent = true;
}

// Read blog cover info from database
const queryBlogCovers = async (requireDecode) => {
    let blogCovers = await sqliteGet(`SELECT * FROM blog ORDER BY date DESC`);
    if (requireDecode) {
        blogCovers.forEach(blog => decodeBlog(blog));
    }
    return blogCovers;
}

// Read blog content from database by blog ID
const queryBlogContent = async (blogID) => {
    let contents = await sqliteGet(`SELECT type, source, description FROM blog_content WHERE blogID = "${blogID}" ORDER BY paragraphIdx`);
    let blogInfo = await sqliteGet(`SELECT * FROM blog WHERE blogID = "${blogID}"`);
    if (blogInfo.length == 0) {
        return null;
    }
    let blogContent = {
        ...blogInfo[0],
        content: contents
    }
    if (blogContent) {
        decodeBlog(blogContent);
    }
    return blogContent;
}

// Read all blog contents in the database, used for search and backup functions
const queryAllBlogs = async () => {
    let blogs = await queryBlogCovers(false);
    for (let blog of blogs) {
        let contents = await sqliteGet(`SELECT type, source, description FROM blog_content WHERE blogID = "${blog.blogID}" ORDER BY paragraphIdx`);
        blog.content = contents;
        decodeBlog(blog);
    }
    return blogs;
}

// Edit information of blog in database with given blog ID
const editBlogDB = async (blogID, blog) => {
    encodeBlog(blog);
    const { title, date, datealt, name, summary, brief, tags, content } = blog;
    const setTitle = `title = ${title}`;
    const setDate = `date = ${date}`;
    const setDatealt = `datealt = ${datealt}`;
    const setName = name ? `name = ${name}` : "";
    const setSummary = `summary = ${summary}`;
    const setBrief = `brief = ${brief}`;
    const setTags = `tags = ${tags}`;
    const newBlogID = hash(name+date);
    const setBlogId = `blogID = "${newBlogID}"`;
    let setAttributes = [setTitle, setDate, setDatealt, setName, setSummary, setBrief, setTags, setBlogId].join(", ");
    await sqliteExec(
        `UPDATE blog SET 
        ${setAttributes} 
        WHERE blogID = "${blogID}"`
    );
    if (content) {
        blogID = newBlogID;
        await sqliteExec(
            `DELETE FROM blog_content WHERE blogID = "${blogID}"`
        );
        for (let paragraph of content) {
            await sqliteExec(`DELETE FROM blog_content WHERE blogID = "${blogID}"`);
            const { paragraphIdx, type, source, description } = paragraph;
            await sqliteExec(
                `INSERT INTO blog (paragraphIdx, type, source, description, blogID) 
                VALUES(
                    ${paragraphIdx},
                    ${type},
                    ${source},
                    ${description},
                    "${blogID}"
                )`
            );
        }
    }
    newBlogContent = true;
}

// Delete blog in database
const deleteBlogDB = async (blogID) => {
    await sqliteExec(
        `DELETE FROM blog WHERE blogID = "${blogID}"`
    );
    await sqliteExec(
        `DELETE FROM blog_content WHERE blogID = "${blogID}"`
    );
    newBlogContent = true;
}

// APIs
const addBlog = async (req, res) => {
    const { blog, password } = req.body;
    const { title, date, datealt, name, summary, brief, tags , content } = blog;
    let msg = {};
    // Sanity check
    if (!(title && date && datealt && name && summary && brief && tags && content 
    && Array.isArray(brief) && brief.length > 0 && Array.isArray(tags) && tags.length > 0
    && Array.isArray(content) && content.length > 0)) {
        msg.succuss = false;
        msg.error = "Form not complete";
    } else if (content.filter(paragraph => !paragraph.source).length == 0) {
        msg.succuss = false;
        msg.error = "Content not valid";
    } else if (!Number.isInteger(date) || date < 20190610 || date > 20500101) {
        msg.success = false;
        msg.error = "Date not valid";
    } else if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    } else {
        try {
            await insertIntoBlog(blog);
            msg.success = true;
        } catch (error) {
            console.log(error);
            msg.success = false;
            msg.error = "See stack trace in server.log";
        }
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const editBlog = async (req, res) => {
    const { blogID, blog, password } = req.body;
    const { title, date, datealt, name, summary, brief, tags , content } = blog;
    let msg = {}
    // Sanity check
    if (!(blogID && title && date && datealt && name && summary && brief && tags && content 
    && Array.isArray(brief) && brief.length > 0 && Array.isArray(tags) && tags.length > 0
    && Array.isArray(content) && content.length > 0)) {
        msg.succuss = false;
        msg.error = "Form not complete";
    } else if (content.filter(paragraph => !paragraph.source).length == 0) {
        msg.succuss = false;
        msg.error = "Content not valid";
    } else if (!Number.isInteger(date) || date < 20190610 || date > 20500101) {
        msg.success = false;
        msg.error = "Date not valid";
    } else if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    }  else {
        try {
            await editBlogDB(blogID, blog);
            msg.success = true;
        } catch (error) {
            console.log(error);
            msg.success = false;
            msg.error = "See stack trace in server.log";
        }
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const deleteBlog = async (req, res) => {
    const { blogID, password } = req.body;
    if (hash(password) != "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = false;
        msg.error = "Wrong password";
    }
    try {
        await deleteBlogDB(blogID);
        msg.success = true;
    } catch(error) {
        console.log(error);
        msg.success = false;
        msg.error = "See stack trace in server.log";
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const getRecentBlogs = async (req, res) => {
    const blogs = await queryBlogCovers(true);
    const recentBlogs = blogs.slice(0, 4).map(blog => ({
        blogID: blog.blogID,
        summary: blog.summary
    }));
    msg = {
        data: recentBlogs
    }
    res.write(JSON.stringify(msg));
    res.end();
}

const getBlogs = async (req, res) => {
    let page = req.body.page;
    let msg = {};

    let blogs = await queryBlogCovers(true);

    let totalPages = Math.ceil(blogs.length/5);
    page = (Number.isInteger(page) && page >= 1) ? page : 1;
    page = (page > totalPages) ? totalPages : page;

    blogs = blogs.slice((page-1)*5, page*5);
    msg.page = page;
    msg.totalPages = totalPages;
    msg.blogs = blogs;

    res.write(JSON.stringify(msg));
    res.end();
}

const getBlogContent = async (req, res) => {
    let blogID = req.body.blogID;
    let msg = {};
    let content = await queryBlogContent(blogID);
    msg.data = {
        content: content.content,
        title: content.title,
        date: content.date
    };
    res.write(JSON.stringify(msg));
    res.end();
}

// Insert initial data to database
const loadBlogFromJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/blog.json");
    const fs = require("fs");

    const blogs = JSON.parse(fs.readFileSync(backupPath));
    for (let blog of blogs.blogs) {
        try {
            await insertIntoBlog(blog);
        } catch (error) {
            console.log("\n" + blog.title + " " + blog.date);
            console.log(error);
            console.log("\n");
        }
    }
}


// Backup database information to JSON
const exportBlogToJSON = async () => {
    const backupPath = path.join(__dirname, "./database/backup/blog.json");
    const fs = require("fs");

    let blogs = await queryAllBlogs();
    fs.writeFileSync(backupPath, JSON.stringify({blogs: blogs}));
}

// Backup daemon
{
    let wakeupinterval = 10 * 60 * 1000;
    setInterval(() => {
        if (newBlogContent) {
            exportBlogToJSON();
        }
        newBlogContent = false;
    }, wakeupinterval);
}

exports.addBlog = addBlog;
exports.editBlog = editBlog;
exports.deleteBlog = deleteBlog;
exports.getRecentBlogs = getRecentBlogs;
exports.getBlogs = getBlogs;
exports.getBlogContent = getBlogContent;

exports.loadBlogFromJSON = loadBlogFromJSON;
exports.exportBlogToJSON = exportBlogToJSON;