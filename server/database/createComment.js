const fs = require("fs");
const { hash, getTimeAsync } = require("../utils");

let commentsDb = {};
blogIDs = [
    "N9y1apsF6w1jVyZo32PR84MUjYXYgmFxP1hPqxsxS14",
    "jiD9ckTskDswPscmItB9IBY05DR4EBVCkP3pn1COaV6",
    "KFdnwbQAlDyOBUXetVCl2TsO3IJlL5nDrAXknMVrg6G",
    "GS3UHI6KatJcPpUbcu313ucQTBl1cSVbaIabpO7Shb5",
    "others"
]
blogIDs.forEach(blogID => { commentsDb[blogID] = [] });
names = [
    "Jerry Lu", "Ivan", "Cody", "Hanson Zhang"
]
contents = [
    "Hello World!",
    "Test comment test comment test comment, test comment. Test comment.",
    "Kekw lol xd",
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

const createComment = async(name, content, link, reply_to) => {
    const time = await getTimeAsync();
    let comment = {
        commentID: hash(name+content+time),
        name: name,
        content: content, 
        link: link,
        time: time,
        reply_to: reply_to,
    }
    return comment;
}

const createSequentialComments = async () => {
    const sequentialLength = rand(3,7);
    const sequentialComments = [];
    const commentIDs = [];
    for (let i = 0; i < sequentialLength; i++) {
        if (i == 0) {
            const comment = await createComment(pick(names), pick(contents), pick(links), null);
            commentIDs.push(comment.commentID);
            sequentialComments.push(comment);
        } else {
            const comment = await createComment(pick(names), pick(contents), pick(links), pick(commentIDs));
            commentIDs.push(comment.commentID);
            sequentialComments.push(comment);
        }
    }
    return sequentialComments;
}

const createComments = async() => {
    let comments = {};
    for (let blogID of blogIDs) {
        let blogComments = [];
        const numSequentials = rand(1,5);
        for (let i = 0; i < numSequentials; i++) {
            blogComments.push(await createSequentialComments());
        }
        comments[blogID] = blogComments;
    }
    fs.writeFileSync("./backup/comment.json", JSON.stringify(comments));
}

createComments();