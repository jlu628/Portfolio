const path = require("path");
const { setup } = require(path.join(__dirname, "./utils.js"));
const main = async () => {
    await setup();
    console.log("Done");
    process.exit(0);
}

main();
