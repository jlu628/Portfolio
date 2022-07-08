const { exec } = require('child_process');
const fs = require('fs');
const blogs = JSON.parse(fs.readFileSync("./meta.json"));
const contents = JSON.parse(fs.readFileSync("./content.json"));
const { hash, getTimeDisplayed} = require("./utils.js");
let searchCache = {};

// Access to blog/project post information
const getRecentPosts = (req, res) => {
    let msg = {}

    let posts = blogs["blogs"];
    posts.sort((a, b) => parseInt(b.date) - parseInt(a.date));
    let recentPosts = [];
    for (let i = 0; i < 4; i++) {
        const post = posts[i];
        recentPosts.push({
            blogID: hash(post.name + post.date),
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
    let filter = req.body.filter;
    let msg = {}
    let posts;
    if (["blogs", "projects"].includes(type)) {
        posts = blogs[type];
    } else if (filter) {
        posts = search(filter);
    } else {
        posts = [];
    }

    let totalPages = Math.ceil(posts.length / 5);
    page = (!Number.isInteger(page) || page < 0) ? 1 : Math.min(page, totalPages);
    msg.page = page;
    msg["totalPages"] = totalPages;
    msg["displayedPosts"] = posts.slice((page - 1) * 5, page * 5);

    if (type == "blogs") {
        msg["displayedPosts"].forEach(displayedPost => {
            displayedPost.blogID = hash(displayedPost.name + displayedPost.date);
        });
    }

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

// Search keywords in posts
const search = (filter) => {
    filter = filter.toLowerCase();
    const cachedResult = searchCache[filter];
    if (cachedResult) {
        searchCache[filter] = {
            result: cachedResult.result,
            time: new Date()
        }
        return cachedResult.result;
    }

    const matchAll = (sourceStr, searchStr) => {
        sourceStr = sourceStr.toLowerCase();
        searchStr = searchStr.toLowerCase();
        let idx = [];
        let start = 0;
        while (true) {
            let nextIdx = sourceStr.indexOf(searchStr);
            if (nextIdx == -1) {
                break;
            }
            idx.push(nextIdx + start);
            start = nextIdx + start + 1;
            sourceStr = sourceStr.substring(nextIdx + 1);
        }
        return idx;
    }
    let result = [];

    // Search in projects with order: title > skills > description > dates
    blogs.projects.forEach((project) => {
        let matches = {};
        let isMatch = false;
        // Search in title
        let titleIdx = matchAll(project.title, filter);
        if (titleIdx.length > 0) {
            isMatch = true;
            matches.title = {
                idx: titleIdx
            };
        }

        // Search in skills
        let skills = project.skills.map(s => s.toLowerCase());
        for (let i = 0; i < skills.length; i++) {
            if (skills[i] == filter || skills[i].split(" ").includes(filter)) {
                isMatch = true;
                matches.skills = {
                    idx: i
                };
                break;
            }
        }

        // Search in description
        let descIdx = [];
        let foundInDesc = false;
        project.description.forEach((paragraph) => {
            let paragraphIdx = matchAll(paragraph, filter);
            foundInDesc = foundInDesc || paragraphIdx.length > 0;
            descIdx.push(paragraphIdx);
        });
        if (foundInDesc) {
            isMatch = true;
            matches.description = {
                idx: descIdx
            };
        }

        // Search in dates
        let datesIdx = matchAll(project.dates, filter);
        if (datesIdx.length > 0) {
            isMatch = true;
            matches.dates = {
                idx: datesIdx
            };
        }

        // Add to result if matches filter
        if (isMatch) {
            result.push({
                post: project,
                type: "projects",
                matches: matches
            })
        }
    });

    // Search in blogs with order: title > briefs > datealt > content > date
    blogs.blogs.forEach(blog => {
        let matches = {};
        let isMatch = false;

        // Search in title
        let titleIdx = matchAll(blog.title, filter);
        if (titleIdx.length > 0) {
            isMatch = true;
            matches.title = {
                idx: titleIdx
            };
        }

        // Search in briefs
        let briefIdx = [];
        let foundInBrief = false;
        blog.brief.forEach((paragraph) => {
            let paragraphIdx = matchAll(paragraph, filter);
            foundInBrief = foundInBrief || paragraphIdx.length > 0;
            briefIdx.push(paragraphIdx);
        });
        if (foundInBrief) {
            isMatch = true;
            matches.brief = {
                idx: briefIdx
            };
        }

        // Search in datealt
        let datealtIdx = matchAll(blog.datealt, filter);
        if (datealtIdx.length > 0) {
            isMatch = true;
            matches.datealt = {
                idx: datealtIdx
            };
        }

        // Stop if already matches and add to result
        if (isMatch) {
            blog.blogID = hash(blog.name + blog.date);
            result.push({
                post: blog,
                type: "blogs",
                matches: matches
            })
            return;
        }

        // Search in contents and dates
        let contentIdx = [];
        let foundInContent = false;
        let blogContent = contents[hash(blog.name + blog.date)].content.slice();
        let date = blog.date
        date = "Posted on " + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
        blogContent.unshift(date);

        blogContent.forEach((paragraph) => {
            if (!(typeof paragraph === 'string' || paragraph instanceof String)) {
                paragraph = paragraph.desc;
            }
            let paragraphIdx = matchAll(paragraph, filter);
            foundInContent = foundInContent || paragraphIdx.length > 0;
            contentIdx.push(paragraphIdx);
        });
        if (foundInContent) {
            isMatch = true;
            matches.content = {
                idx: contentIdx
            };
        }

        // Add to result if matches
        if (isMatch) {
            blog.blogID = hash(blog.name + blog.date);
            result.push({
                post: blog,
                type: "blogs",
                matches: matches,
                content: contents[blog.blogID]
            });
        }
    });

    result.sort((a, b) => parseInt(b.post.date) - parseInt(a.post.date));
    searchCache[filter] = {
        result: result,
        time: new Date()
    }
    return result;
}

// Cache cleaner daemon
{
    let threshold = 60 * 60 * 1000;
    let wakeupinterval = 60 * 1000;
    const cleanCache = () => {
        const timeStamp = new Date();
        let removed = 0;
        for (var filter in searchCache) {
            if (timeStamp - searchCache[filter].time > threshold) {
                delete searchCache[filter];
                removed++;
            }
        }
        return removed;
    }
    setInterval(() => {
        let removed = cleanCache();
        fs.writeFileSync("./searchCache.json", JSON.stringify(searchCache));
        let size = (fs.statSync("./searchCache.json").size / 1024 / 1024).toFixed(3);
        if (removed > 0) {
            console.log(`${getTimeDisplayed()}: ${removed} cache entries removed, cache size ${size} MB`);
        }
    }, wakeupinterval);
}

exports.getRecentPosts = getRecentPosts;
exports.getPostPage = getPostPage;
exports.getContentPage = getContentPage;