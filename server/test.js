const path = require("path");
const { setup } = require(path.join(__dirname, "./utils.js"));
const { loadProjectFromJSON } = require(path.join(__dirname, "./project.js"));
const { loadCommentFromJSON } = require(path.join(__dirname, "./comment.js"));
const { loadBlogFromJSON } = require(path.join(__dirname, "./blog.js"));
const { loadPasswordFromJSON } = require(path.join(__dirname, "./admin.js"))
const main = async () => {
    await setup();
    console.log("Done")
}

main();
