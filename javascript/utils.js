// Provide hash function in base 62
// Need to include the cdn sha256 library 
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

// Parse the query string into json
const parseQueryString = () => {
    let queryString = window.location.search.substring(1);
    queryString = queryString.split('&');
    let query = {};
    queryString.forEach(q => {
        q = q.split("=");
        query[q[0]] = q[1];
    });
    return query;
}

// Append query key value pair to the query string
const appendQueryString = (key, value) => {
    let query = parseQueryString();
    query[key] = value;
    let queryString = "?";
    for (let q in query) {
        queryString += `${q}=${query[q]}&`;
    }
    return queryString.substring(0, queryString.length - 1);
}

// Bind enter key to search button in navbar
const bindSearch = () => {
    // Define behavior when search icon is clicked
    // Get search content in navbar and set href to redirect page
    let searchIcon = document.getElementById("searchIcon");
    searchIcon.onclick = () => {
        let searchInput = document.getElementById('search');
        document.getElementById("searchIcon").href = `search.html?filter=${searchInput.value}`;
        console.log(searchInput.value);
        return !(searchInput.value === null || searchInput.value.match(/^ *$/) !== null);
    };

    // Bind enter key to search icon
    let searchInput = document.getElementById('search');
    searchInput.value = "";
    searchInput.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            searchIcon.click();
        }
    })
}