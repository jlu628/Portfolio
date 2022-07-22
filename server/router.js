const express = require("express");
const router = express.Router();
const blog = require("./blog")
const project = require("./project")
const comment = require("./comment")
const search = require("./search")

// Project manager
router.post("/admin/addProject", project.addProject);
router.post("/admin/editProject", project.editProject);
router.post("/admin/deleteProject", project.deleteProject);
router.post("/getProjects", project.getProjects);

// Blog manager
router.post("/admin/addBlog", blog.addBlog);
router.post("/admin/editBlog", blog.editBlog);
router.post("/admin/deleteBlog", blog.deleteBlog);
router.post("/getRecentBlogs", blog.getRecentBlogs);
router.post("/getBlogs", blog.getBlogs);
router.post("/getBlogContent", blog.getBlogContent);

// Comment manager
router.post("/admin/editComment", comment.editComment);
router.post("/admin/deleteComment", comment.deleteComment);
router.post("/addComment", comment.addComment);
router.post("/getBlogComments", comment.getBlogComments);

// Search manager
router.post("/search", search.search);

module.exports = router;