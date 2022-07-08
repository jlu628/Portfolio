const express = require("express");
const router = express.Router();
const blog = require("./blog")
const comment = require("./comment")

router.post("/getRecentPosts", blog.getRecentPosts);
router.post("/getPostPage", blog.getPostPage);
router.post("/getContentPage", blog.getContentPage);

router.post("/getBlogComments", comment.getBlogComments);
router.post("/getAllComments", comment.getAllComments);
router.post("/writeComment", comment.writeComment);

module.exports = router;