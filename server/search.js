const path = require("path");
const { queryAllBlogs } = require("./blog");
const { queryAllProject } = require("./project");
const { removeHTMLTags, getTimeDisplayed } = require("./utils");

const fs = require("fs");
const backupPath = path.join(__dirname, "./database/backup/searchCache.json")
let searchCache = fs.existsSync(backupPath) ? JSON.parse(fs.readFileSync(backupPath)) : {};
let newItems = 0;

const useCache = false;

const searchProject = (filter, project) => {
    let output = {
        match: false,
        in: []
    }
    const { title, dates, skills, description } = project;

    // Search in title and dates
    if (title.toLowerCase().includes(filter)) {
        output.match = true;
        output.in.push("title");
    }
    if (dates.toLowerCase().includes(filter)) {
        output.match = true;
        output.in.push("dates");
    }

    // Search in skills
    for (let skill of skills) {
        if (skill.split(' ').map(s => s.toLowerCase()).includes(filter)) {
            output.match = true;
            output.in.push("skills");
            break;
        }
    }

    // Search in description
    for (let paragraph of description) {
        if (removeHTMLTags(paragraph).toLowerCase().includes(filter)) {
            output.match = true;
            output.in.push("description");
            break;
        }
    }

    return output;
}

const searchBlog = (filter, blog) => {
    let output = {
        match: false,
        in: []
    }
    const { title, datealt, brief, date, content } = blog;

    // Search in title and datealt
    if (title.toLowerCase().includes(filter)) {
        output.match = true;
        output.in.push("title");
    }
    if (datealt.toLowerCase().includes(filter)) {
        output.match = true;
        output.in.push("datealt");
    }

    // Search in brief
    for (let paragraph of brief) {
        if (removeHTMLTags(paragraph).toLowerCase().includes(filter)) {
            output.match = true;
            output.in.push("brief");
            break;
        }
    }

    if (output.match) {
        return output;
    }

    // Search in content
    for (let paragraph of content) {
        if (paragraph.type == "text" && removeHTMLTags(paragraph.source).toLowerCase().includes(filter)) {
            output.match = true;
            output.in.push("content");
            break;
        } else if (paragraph.type != "text" && paragraph.description && removeHTMLTags(paragraph.description).toLowerCase().includes(filter)) {
            output.match = true;
            output.in.push("content");
            break;
        }
    }

    return output;
}

const search = async(req, res) => {
    let { filter, page } = req.body;
    let msg = {
        matches: []
    }
    if (!filter || !filter.trim()) {
        res.write(JSON.stringify(msg));
        res.end();
        return;
    }

    filter = filter.toLowerCase();

    try {
        // Query all posts from database
        const blogs = await queryAllBlogs();
        const projects = await queryAllProject();

        // Query from cache
        if (useCache && searchCache[filter.toLowerCase()]) {
            // Update last queried time in cache
            searchCache[filter.toLowerCase()].time = new Date();
            msg.matches = searchCache[filter.toLowerCase()].result;
        } else {
            // Search in blogs
            for (let blog of blogs) {
                const searchResult = searchBlog(filter, blog);
                if (searchResult.match) {
                    msg.matches.push({
                        match: searchResult.in,
                        type: "blog",
                        data: blog
                    });
                }
            }
            // Search in projects
            for (let project of projects) {
                const searchResult = searchProject(filter, project);
                if (searchResult.match) {
                    msg.matches.push({
                        match: searchResult.in,
                        type: "project",
                        data: project
                    });
                }
            }
            msg.matches.sort((a, b) => b.data.date - a.data.date);

            // Save to cache
            if (useCache) {
                searchCache[filter.toLowerCase()] = {
                    time: new Date(),
                    result: msg.matches
                }
                newItems++;
            }
        }
    } catch (error) {
        console.log(error);
        res.write(JSON.stringify(msg));
        res.end();
        return;
    }

    // For pagination
    let totalPages = Math.ceil(msg.matches.length / 5);
    page = (Number.isInteger(page) && page >= 1) ? page : 1;
    page = (page > totalPages) ? totalPages : page;

    msg.matches = msg.matches.slice((page - 1) * 5, page * 5);
    msg.page = page;
    msg.totalPages = totalPages;

    res.write(JSON.stringify(msg));
    res.end();
}

// Daemon cache update
if (useCache) {
    let threshold = 60 * 60 * 1000;
    let wakeupinterval = 1000;

    const cleanCache = () => {
        const timeStamp = new Date();
        let removed = 0;
        for (let filter in searchCache) {
            if (timeStamp - searchCache[filter].time > threshold) {
                delete searchCache[filter];
                removed++;
            }
        }
        return removed;
    }

    const backupCache = () => {
        let removedItems = cleanCache();
        if (newItems > 0 || removedItems > 0) {
            fs.writeFileSync(backupPath, JSON.stringify(searchCache));
            let size = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(3);
            console.log(`${getTimeDisplayed()}: ${newItems} entries added, ${removedItems} entries removed, cache size ${size} MB`);
        }
        newItems = 0;
    }

    setInterval(backupCache, wakeupinterval);
}

exports.search = search;