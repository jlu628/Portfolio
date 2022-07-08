const sha256 = require("sha256");
const hash = (str) => {
    str = sha256(str);
    const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const add = (x, y, base) => {
        let z = [];
        const n = Math.max(x.length, y.length);
        let carry = 0;
        let i = 0;
        while (i < n || carry) {
            const xi = i < x.length ? x[i] : 0;
            const yi = i < y.length ? y[i] : 0;
            const zi = carry + xi + yi;
            z.push(zi % base);
            carry = Math.floor(zi / base);
            i++;
        }
        return z;
    }

    const multiplyByNumber = (num, x, base) => {
        if (num < 0) return null;
        if (num == 0) return [];

        let result = [];
        let power = x;
        while (true) {
            num & 1 && (result = add(result, power, base));
            num = num >> 1;
            if (num === 0) break;
            power = add(power, power, base);
        }

        return result;
    }

    const parseToDigitsArray = (str) => {
        const digits = str.split('');
        let arr = [];
        for (let i = digits.length - 1; i >= 0; i--) {
            const n = DIGITS.indexOf(digits[i])
            if (n == -1) return null;
            arr.push(n);
        }
        return arr;
    }

    const digits = parseToDigitsArray(str);
    if (digits === null) return null;

    let outArray = [];
    let power = [1];
    for (let i = 0; i < digits.length; i++) {
        digits[i] && (outArray = add(outArray, multiplyByNumber(digits[i], power, 62), 62));
        power = multiplyByNumber(16, power, 62);
    }

    let out = '';
    for (let i = outArray.length - 1; i >= 0; i--)
        out += DIGITS[outArray[i]];

    return out;
}

const getTimeAsync = async() => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    await new Promise(r => setTimeout(r, 1000));
    return parseInt([
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(""));
};

const getTime = () => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    return parseInt([
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(""));
};

const getTimeDisplayed = () => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');
    let date = new Date;
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),].join("-") + " " + 
        [padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
    ].join(":");
};

exports.hash = hash;
exports.getTime = getTime;
exports.getTimeAsync = getTimeAsync
exports.getTimeDisplayed = getTimeDisplayed;