const { hash } = require("../../utils");

const blogName = `"triphome"`
const blogDate = 20220606

console.log(hash(blogName + blogDate));