const path = require("path");
const { hash } = require(path.join(__dirname, "./utils"));

const tokenStorage = {}

const verify = async(req, res) => {
    let password = req.body.password;
    msg = {}
    if (hash(password) == "oKaVXnQ0YZ61k3EOJakytljtnkVg49mBjeVqhwRItsf") {
        msg.success = true;
        const time = Date.now();
        const token = hash(String(req) + String(time))
        msg.token = token
        tokenStorage[token] = time;
    } else {
        msg.success = false;
    }
    res.write(JSON.stringify(msg))
    res.end();
}





exports.verify = verify;