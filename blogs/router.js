const express = require("express");
const router = express.Router();
const blog = require("./blog")

router.get("/getRecentPosts", blog.getRecentPosts);
router.post("/getPostPage", blog.getPostPage);
router.post("/getContentPage", blog.getContentPage);

module.exports = router;