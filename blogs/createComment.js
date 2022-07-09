const fs = require("fs");
const { hash, getTimeAsync } = require("./utils");

let commentsDb = {};
blogIDs = [
    "CqB4bLSpMyK1LLPmywDcCOuMPfJu3ttoaG6sCWzLP8J",
    "MBM6umuNgVwlBK0MBZsSdv6ytQ6Sw1kj7RGqCrMVt1N",
    "tGTJpzT1Dcm2y3exhnGBu0RGWfJPnp8r1GwIgdnBWX0",
    "pNqOQjO77PENEQXbrBuoFLV7eqg1UH2rAnjznbpAgjV",
    "others"
]
blogIDs.forEach(blogID => { commentsDb[blogID] = [] });
names = [
    "Jerry", "Ivan", "Cody", "Hanson"
]
contents = [
    "Hello World!",
    "Comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment comment",
    "Test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    "Lorem ipsum dolor",
]
links = [
    "https://google.com",
    "https://youtube.com",
    "https://facebook.com",
    "https://linkedin.com"
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createBlockComments = async() => {
    const iters = rand(3, 10);
    let commentIDs = [];
    let blockComments = {};
    for (let i = 0; i < iters; i++) {
        let section = {
            name: pick(names),
            content: pick(contents),
            link: rand(0, 10) <= 3 ? pick(links) : "",
            time: await getTimeAsync(),
            reply_to: null
        }
        let commentID = hash(section.name + section.content + section.time);
        if (commentIDs.length > 0) {
            section.reply_to = pick(commentIDs);
        }
        blockComments[commentID] = section;
        commentIDs.push(commentID);
    }
    return blockComments;
}

const createComments = async() => {
    for (let i = 0; i < blogIDs.length; i++) {
        let id = blogIDs[i];
        const iters = rand(1, 5);
        let comments = commentsDb[id];
        for (let i = 0; i < iters; i++) {
            comments.push(await createBlockComments());
        }
    }
    fs.writeFileSync("./commentsData.json", JSON.stringify(commentsDb));
}

createComments();