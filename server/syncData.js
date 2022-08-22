const path = require("path");
const { exportProjectToJSON } = require(path.join(__dirname, "./project.js"));
const { exportCommentToJSON } = require(path.join(__dirname, "./comment.js"));
const { exportBlogToJSON } = require(path.join(__dirname, "./blog.js"));

const main = async () => {
    await exportProjectToJSON();
    await exportCommentToJSON();
    await exportBlogToJSON();
    console.log("Done");
    process.exit(0);
}

main();
