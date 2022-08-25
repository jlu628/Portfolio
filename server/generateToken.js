const { hash } = require("./utils");

const blogName = "catimages"
const blogDate = 20220315

console.log(hash(`"${blogName}"` + blogDate));