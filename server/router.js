const express = require("express");
const router = express.Router();
const oldBlog = require("./oldBlog")
const blog = require("./blog")
const comment = require("./comment")
const project = require("./project")

// Project manager
router.post("/admin/addProject", project.addProject);
router.post("/admin/editProject", project.editProject);
router.post("/admin/deleteProject", project.deleteProject);
router.post("/getProjects", project.getProjects);

// Blog manager
router.post("/getRecentBlogs", blog.getRecentBlogs);
router.post("/getBlogs", blog.getBlogs);
router.post("/getBlogContent", blog.getBlogContent);
router.post("/admin/addBlog", blog.addBlog);
router.post("/admin/editBlog", blog.editBlog);
router.post("/admin/deleteBlog", blog.deleteBlog);

router.post("/getRecentPosts", oldBlog.getRecentPosts);
router.post("/getPostPage", oldBlog.getPostPage);
router.post("/getContentPage", oldBlog.getContentPage);

router.post("/getBlogComments", comment.getBlogComments);
router.post("/getAllComments", comment.getAllComments);
router.post("/writeComment", comment.writeComment);

module.exports = router;