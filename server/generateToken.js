const { hash } = require("./utils");

const blogName = "versionhistory"
const blogDate = 20210125

console.log(hash(`"${blogName}"` + blogDate));