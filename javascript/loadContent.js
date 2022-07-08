// Load blog contents
const createContent = (blogContent, imgFolder) => {
    let date = blogContent.date;
    date = "Posted on " + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
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
            <img src="${c.type == "image" ? imgFolder+c.src : c.src}">
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

// Load blog comments
const scrollIntoComment = (commentID, highlight) => {
    const comment = document.getElementById(commentID);

    comment.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });

    if (highlight) {
        let scrollTimeout = setTimeout(function() {
            comment.style.backgroundColor = "var(--blue-light-semi-transparent)";
            setTimeout(() => {
                comment.style.backgroundColor = "transparent";
            }, 150);
            removeEventListener("scroll", onScrollEnd);
        }, 100);

        const onScrollEnd = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                console.log("executed")
                comment.style.backgroundColor = "var(--blue-light-semi-transparent)";
                setTimeout(() => {
                    comment.style.backgroundColor = "transparent";
                }, 150);
                removeEventListener("scroll", onScrollEnd);
            }, 100);
        };

        addEventListener('scroll', onScrollEnd);
    }
}

const createSectionComment = (sectionComments) => {
    let html = `<div class="section-comments">`

    commentIDs = Object.keys(sectionComments).sort((a, b) => parseInt(a.time) - parseInt(b.time));
    commentIDs.forEach((commentID, idx) => {
        let comment = sectionComments[commentID];
        let time = comment.time.toString();
        let name = comment.link ? `<a href="${comment.link}" target="_blank" class="semiblackfont">${comment.name}</a>` :
            `<text>${comment.name}</text>`;
        let reply = comment.reply_to ? `&nbsp;
                <a onClick="scrollIntoComment('${comment.reply_to}', true)">
                    @${sectionComments[comment.reply_to].name}
                </a>` : "";

        html += `
            <div class="comment ${idx == 0 ? "" : "comment-followup"}" id="${commentID}">
                <div class="midfont semiblackfont">
                    ${name}${reply}
                </div>
                <text class="midfont blackfont">
                    ${comment.content}
                </text>
                <div class="semiblackfont">
                    <text class="smallfont">
                        ${[
                            time.substring(0,4),
                            time.substring(4,6),
                            time.substring(6,8)
                        ].join("-") + " " + [
                            time.substring(8,10),
                            time.substring(10,12),
                            time.substring(12,14),
                        ].join(":")}
                    </text>
                    <a class="midfont" onclick="expandCommentBox('reply-${commentID}')">reply</a>
                </div>
            </div>
            ${createCommentBox(commentID, comment.name, idx == 0)}
        `
    });

    html += `</div>`
    return html;
}

const createCommentBox = (replyTo, replyName, isFirst) => {
    const prefilledName = window.localStorage.username ? window.localStorage.username : "";
    const prefilledSite = window.localStorage.usersite ? window.localStorage.usersite : "";
    let reply = replyTo ? `<a onClick="scrollIntoComment('${replyTo}', true)" class="semiblackfont">@${replyName}</a>&nbsp;` : "";
    let html = `
    <div class="comment-form-container midfont ${replyName ? "comment-form-followup-container" : ""} ${isFirst ? "comment-form-first-followup-container" : ""}" id="reply-${replyTo}">
        <div class="comment-form-top">
            <input name="name" type="text" placeholder="name*" maxLength="30" value="${prefilledName}">
            <input name="link" type="text" placeholder="website (http://)" value="${prefilledSite}">
        </div>
        <textarea placeholder="Leave a friendly comment here..."></textarea>
        <div class="comment-form-bottom">
            <a onclick="collapseCommentBox('reply-${replyTo}');clearCommentBox('reply-${replyTo}');">Cancel</a>
            <span>${reply}<a onclick="sendComment('reply-${replyTo}', '${replyTo}', '${parseQueryString().blogID}')">Send</a></span>
        </div>
    </div>
    `
    return html;
}

const collapseCommentBox = (commentBoxID) => {
    document.getElementById(commentBoxID).classList.remove("comment-form-followup-container-active");
    document.getElementById(commentBoxID).style.maxHeight = "0";
}

const expandCommentBox = (commentBoxID) => {
    document.querySelectorAll(".comment-form-followup-container-active").forEach((node) => {
        collapseCommentBox(node.id);
    })
    document.getElementById(commentBoxID).style.maxHeight = "400px";
    document.getElementById(commentBoxID).classList.add("comment-form-followup-container-active");
}

const clearCommentBox = (commentBoxID) => {
    let commentBox = document.getElementById(commentBoxID);
    let inputs = commentBox.getElementsByTagName("input");
    inputs[0].value = window.localStorage.username ? window.localStorage.username : "";
    inputs[1].value = window.localStorage.usersite ? window.localStorage.usersite : "";
    commentBox.getElementsByTagName("textarea")[0].value = "";
}

const sendComment = (commentBoxID, replyTo, blogID) => {
    // Get inputs
    let commentBox = document.getElementById(commentBoxID);
    let inputs = commentBox.getElementsByTagName("input");
    let name = inputs[0].value.trim();
    let site = inputs[1].value.trim();
    let content = commentBox.getElementsByTagName("textarea")[0].value.trim();

    window.localStorage.username = name;
    window.localStorage.usersite = site;
    if (!name) {
        alert("Name cannot be empty");
        return;
    } else if (!content) {
        alert("Reply content cannot be empty");
        return;
    }

    let header = new Headers();
    header.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "blogID": blogID,
        "name": name,
        "content": content,
        "reply_to": replyTo,
        "link": site
    });

    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:3000/writeComment", requestOptions)
        .then(response => response.json())
        .then(msg => {
            console.log(msg)
            if (msg.success) {
                loadComments();
            } else {
                alert("Failed to send comment. Please try again later...");
            }
        });
}

const loadComments = () => {
    const blogID = parseQueryString().blogID;
    const commentContainer = document.querySelector(".comment-container");
    commentContainer.innerHTML = `<text class="largefont blackfont">Comments</text>`

    var header = new Headers();
    header.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "blogID": blogID,
    });
    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };
    fetch("http://127.0.0.1:3000/getBlogComments", requestOptions)
        .then(response => response.json())
        .then(commentSections => {
            commentSections.comments.forEach(section => {
                commentContainer.innerHTML += createSectionComment(section);
            });

            const prefilledName = window.localStorage.username ? window.localStorage.username : "";
            const prefilledSite = window.localStorage.usersite ? window.localStorage.usersite : "";
            commentContainer.innerHTML += `
        <div class="comment-form-container midfont" id="newcommentform">
            <div class="comment-form-top">
                <input name="name" type="text" placeholder="name*" maxLength="30" value="${prefilledName}">
                <input name="link" type="text" placeholder="website (http://)" value="${prefilledSite}">
            </div>
            <textarea placeholder="Leave a friendly comment here..."></textarea>
            <div class="comment-form-bottom">
                <a onclick="clearCommentBox('newcommentform');">Cancel</a>
                <a onclick="sendComment('newcommentform', '', '${blogID}')">Send</a>
            </div>
        </div>
        `
        });
}