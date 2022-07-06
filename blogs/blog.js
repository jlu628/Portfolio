const fs = require('fs');
const sha256 = require('sha256');
const blogs = JSON.parse(fs.readFileSync("./meta.json"));
const contents = JSON.parse(fs.readFileSync("./content.json"));
let searchCache = {};

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
        return [...sourceStr.toLowerCase().matchAll(new RegExp(searchStr.toLowerCase(), 'gi'))].map(a => a.index);
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
        if (skills.includes(filter)) {
            isMatch = true;
            matches.skills = {
                idx: skills.indexOf(filter)
            };
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
    const typeSizes = {
        "undefined": () => 0,
        "boolean": () => 4,
        "number": () => 8,
        "string": item => 2 * item.length,
        "object": item => !item ? 0 : Object
            .keys(item)
            .reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0)
    };
    const sizeOf = value => typeSizes[typeof value](value);

    let threshold = 60 * 60 * 1000;
    let wakeupinterval = 5 * 60 * 1000;
    const cleanCache = () => {
        const timeStamp = new Date();
        let removed = 0;
        for (var filter in searchCache) {
            if (timeStamp - searchCache[filter].time > threshold) {
                delete searchCache[filter];
                removed++;
            }
        }
        return [timeStamp, removed];
    }
    setInterval(function() {
        const [timeStamp, removed] = cleanCache();
        const cacheSize = sizeOf(searchCache) / 1024 / 1024;
        console.log(`${timeStamp}: ${removed} entries removed from search result cache, current cache takes ${cacheSize} MB`);
    }, wakeupinterval);
}

exports.getRecentPosts = getRecentPosts;
exports.getPostPage = getPostPage;
exports.getContentPage = getContentPage;