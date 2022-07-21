const { setup, sqliteGet } = require('./utils');
const path = require('path');
const project = require('./project');
const blog = require('./blog');
const comment = require('./comment');

const test = async () => {
    await setup();
    await project.loadProjectFromJSON();
    await project.exportProjectToJSON();

    await blog.loadBlogFromJSON();
    await blog.exportBlogToJSON();

    await comment.loadCommentFromJSON();
    await comment.exportCommentToJSON();
    
    // const contents = await sqliteGet(`SELECT * FROM blog_content`);
    // console.log(contents)
}
test();