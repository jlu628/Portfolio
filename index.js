const express = require("express");
const app = express();
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, cache-control, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "100kb" }));

const cors = require("cors");
app.use(cors());

const routes = require("./server/router");
app.use("/", routes);

app.use(express.static("./public", {extensions:['html']}));
app.use(express.static("./admin", {extensions:['html']}));

// Redirect outputs
// const fs = require("fs");
// let fh = fs.createWriteStream('./server/server.log');
// process.stdout.write = process.stderr.write = fh.write.bind(fh);

const port = process.env.PORT || 3000;
instance = app.listen(port, () => {
    console.log(`server running on PORT: ${port}`);
});