const fs = require('fs');
const blogs = JSON.parse(fs.readFileSync("./meta.json"));
const contents = JSON.parse(fs.readFileSync("./content.json"));

const getRecentPosts = (req, res) => {
    let msg = {}

    let posts = blogs["blogs"];
    posts.sort((a, b) => parseInt(b.date) - parseInt(a.date));
    let recentPosts = [];
    for (let i = 0; i < 4; i++) {
        const post = posts[i];
        recentPosts.push({
            name: post.name,
            date: post.date,
            summary: post.summary
        });
    }
    msg.recentPosts = recentPosts;
    res.write(JSON.stringify(msg));
    res.end();
}

const getPostPage = (req, res) => {
    let type = req.body.type;
    let page = req.body.page;
    let tag = req.body.tag;
    let msg = {}

    let posts = blogs[type];
    if (tag) {
        posts = posts.filter(blog => blog.tags.includes(tag));
    }
    let totalPages = Math.ceil(posts.length / 5);
    page = page < 0 ? 1 : Math.min(page, totalPages);
    msg.page = page;

    msg["totalPages"] = totalPages;
    msg["displayedPosts"] = posts.slice((page - 1) * 5, page * 5);

    res.write(JSON.stringify(msg));
    res.end();
}

const getContentPage = (req, res) => {
    let blogID = req.body.blogID;
    let msg = {}

    msg.content = contents[blogID];

    res.write(JSON.stringify(msg));
    res.end();
}

exports.getRecentPosts = getRecentPosts;
exports.getPostPage = getPostPage;
exports.getContentPage = getContentPage;