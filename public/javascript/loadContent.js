// Load blog contents
const createContent = (blogContent, imgFolder) => {
    let date = blogContent.date.toString();
    date = "Posted on " + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
    let edit = blogContent.edit;
    if (edit != -1) {
        edit = edit.toString();
        date += "<br> Edited on " + edit.substring(0, 4) + "-" + edit.substring(4, 6) + "-" + edit.substring(6, 8);
    }

    let html = `
    <text class="titlefont largefont">${blogContent.title}</text>
    <div class="date-container"><text class="smallfont semiblackfont">${date}</text></div>
    <hr>
    <div class="blog-content-container midfont">
    `
    blogContent.content.forEach(paragraph => {
        if (paragraph.type == "text") {
            html += `<p>${paragraph.source}</p>`
        } else {
            let styles = paragraph.styles ? `class='${paragraph.styles}'` : "class='himg'";
            let media = paragraph.type == "image" ? `<img ${styles} src="${imgFolder+paragraph.source}">` : paragraph.source
            html += `
            ${media}
            <div class="img-descriptor semiblackfont smallfont">
                ${paragraph.description || ""}
            </div>
            `
        }
    });
    html += `</div>`

    return html;
}

const loadContent = () => {
    const blogID = parseQueryString().blogID;
    const imgFolder = `/images/${blogID}/`;

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

    fetch(`${serverURL}/getBlogContent`, requestOptions)
        .then(response => response.json())
        .then(data => {
            const blogContent = data.data;
            document.querySelector(".blog-container").innerHTML = createContent(blogContent, imgFolder);
        })
        .catch(error => console.log('error', error));
}