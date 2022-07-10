const express = require("express");
const router = express.Router();
const blog = require("../blogs/blog")
const comment = require("../blogs/comment")
const path = require("path");

router.post("/getRecentPosts", blog.getRecentPosts);
router.post("/getPostPage", blog.getPostPage);
router.post("/getContentPage", blog.getContentPage);

router.post("/getBlogComments", comment.getBlogComments);
router.post("/getAllComments", comment.getAllComments);
router.post("/writeComment", comment.writeComment);

module.exports = router;