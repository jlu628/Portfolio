const createContent = (blogContent, imgFolder) => {
    let date = blogContent.date;
    date = date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
    let html = `
    <text class="titlefont largefont">${blogContent.title}</text>
    <div class="date-container"><text class="smallfont semiblackfont">${date}</text></div>
    <hr>
    <div class="blog-content-container midfont">
    `
    blogContent.content.forEach(c => {
        if (typeof c === 'string' || c instanceof String) {
            html += `<p>${c}</p>`
        } else {
            html += `
            <img src="${imgFolder+c.src}">
            <div class="img-descriptor semiblackfont smallfont">
                ${c.desc}
            </div>
            `
        }
    });
    html += `</div>`

    return html;
}

const loadContent = () => {
    const blogID = parseQueryString().blogID;
    const imgFolder = `blogs/images/${blogID}/`;

    var header = new Headers();
    header.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "blogID": blogID
    });

    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:3000/getContentPage", requestOptions)
        .then(response => response.json())
        .then(data => {
            const blogContent = data.content;
            document.querySelector(".blog-container").innerHTML = createContent(blogContent, imgFolder);
        })
        .catch(error => console.log('error', error));
}