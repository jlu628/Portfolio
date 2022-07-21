const { setup, sqliteGet } = require('./utils');
const path = require('path');
const dbPath = path.join(__dirname, './database/test_posts.db');
const project = require('./project');
const blog = require('./blog');
const test = async () => {
    await setup();
    await project.loadProjectFromJSON()
    await blog.loadBlogFromJSON();
    await blog.exportBlogToJSON();
    // const contents = await sqliteGet(`SELECT * FROM blog_content`);
    // console.log(contents)
}
test();