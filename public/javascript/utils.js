// Define Webserver url
// const serverURL = "https://jiayu-lu.com/"
const serverURL = "http://127.0.0.1:3000"

// Parse the query string into json
const parseQueryString = () => {
    let queryString = decodeURI(window.location.search.substring(1));
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
        let href = `search?filter=${searchInput.value.trim()}&page=1`
        document.getElementById("searchIcon").href = encodeURI(href);
        return !(searchInput.value === null || searchInput.value.match(/^ *$/) !== null);
    };

    // Bind enter key to search icon
    let searchInput = document.getElementById('search');
    searchInput.value = "";
    searchInput.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            searchIcon.click();
        }
    });
}