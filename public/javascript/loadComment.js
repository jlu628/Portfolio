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

const createSectionComment = (sectionComments, blogID, referBlogs, fromPage) => {
    let html = `<div class="section-comments">`
    let referToName = {};
    sectionComments.forEach((comment, idx) => {
        referToName[comment.commentID] = comment.name;
        let time = comment.time.toString();
        let name = comment.link ? `<a href="${comment.link}" target="_blank" class="semiblackfont">${comment.name}</a>` :
            `<text>${comment.name}</text>`;
        let refer = idx == 0 ? (
            referBlogs.refer ? `&nbsp;&nbsp; &#8594; &nbsp;&nbsp;
            <a href="content?blogID=${blogID}" target="_blank">${referBlogs.title}</a>` : ""
        ) : "";
        let reply = comment.reply_to ? `&nbsp; &#8594; &nbsp; 
                <a onClick="scrollIntoComment('${comment.reply_to}', true)">
                    @${referToName[comment.reply_to]}
                </a>` : "";

        html += `
            <div class="comment ${idx == 0 ? "" : "comment-followup"}" id="${comment.commentID}">
                <div class="midfont semiblackfont">
                    ${name}${refer}${reply}
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
                    <a class="midfont" onclick="expandCommentBox('reply-${comment.commentID}', ${fromPage})">reply</a>
                </div>
            </div>
            ${createCommentBox(comment.commentID, comment.name, idx == 0, blogID, fromPage)}
        `
    });

    html += `</div>`
    if (fromPage) {
        html = `<div>${html}</div>`
    }
    return html;
}

const createCommentBox = (replyTo, replyName, isFirst, blogID, fromPage) => {
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
            <a onclick="collapseCommentBox('reply-${replyTo}', ${fromPage});clearCommentBox('reply-${replyTo}');">Cancel</a>
            <span>${reply}<a onclick="sendComment('reply-${replyTo}', '${replyTo}', '${blogID}', ${fromPage})">Send</a></span>
        </div>
    </div>
    `
    return html;
}

const collapseCommentBox = (commentBoxID, fromPage) => {
    document.getElementById(commentBoxID).classList.remove("comment-form-followup-container-active");
    document.getElementById(commentBoxID).style.maxHeight = "0";
    if (fromPage) {
        document.getElementById(commentBoxID).style.border = "none";
    }
}

const expandCommentBox = (commentBoxID, fromPage) => {
    document.querySelectorAll(".comment-form-followup-container-active").forEach((node) => {
        collapseCommentBox(node.id, fromPage);
    })
    document.getElementById(commentBoxID).style.maxHeight = "400px";
    if (fromPage) {
        document.getElementById(commentBoxID).style.border = "solid var(--shadow)";
    }
    document.getElementById(commentBoxID).classList.add("comment-form-followup-container-active");

    let focus = window.localStorage.username ? (window.localStorage.usersite ? "textarea" : ".comment-form-top>input:nth-child(2)") : "comment-form-top>input:nth-child(1)";
    document.querySelector(`.comment-form-followup-container-active ${focus}`).focus();
}

const clearCommentBox = (commentBoxID) => {
    let commentBox = document.getElementById(commentBoxID);
    let inputs = commentBox.getElementsByTagName("input");
    inputs[0].value = window.localStorage.username || "";
    inputs[1].value = window.localStorage.usersite || "";
    commentBox.getElementsByTagName("textarea")[0].value = "";
}

const sendComment = (commentBoxID, replyTo, blogID, fromPage) => {
    // Get inputs
    let commentBox = document.getElementById(commentBoxID);
    let inputs = commentBox.getElementsByTagName("input");
    let name = inputs[0].value.trim().replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    let site = inputs[1].value.trim().replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    let content = commentBox.getElementsByTagName("textarea")[0].value.trim().replaceAll("<", "&lt;").replaceAll(">", "&gt;");

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
        comment: {
            "blogID": blogID,
            "name": name,
            "content": content,
            "reply_to": replyTo,
            "link": site
        }
    });

    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };

    fetch(`${serverURL}/addComment`, requestOptions)
        .then(response => response.json())
        .then(msg => {
            if (msg.success) {
                if (!fromPage) {
                    loadComments();
                } else {
                    loadCommentPage();
                }
            } else {
                if (msg.error == "Invalid link") {
                    alert(`Website link must starts with "http://" or "https://"`);
                } else {
                    alert("Failed to send comment. Please try again later...");
                }
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
    fetch(`${serverURL}/getBlogComments`, requestOptions)
        .then(response => response.json())
        .then(comments => {
            comments.data.forEach(section => {
                commentContainer.innerHTML += createSectionComment(section, blogID, {refer:false}, false);
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
                    <a onclick="sendComment('newcommentform', '', '${blogID}', false)">Send</a>
                </div>
            </div>
            `
            if (comments.data.length == 0) {
                commentContainer.innerHTML += `
                <div class="midfont" style="margin: 5vh auto;display:flex;flex-direction:column;align-items:center;">
                        No comments yet. Be the first one to leave a mark on this page
                        <img style="height: 30vh;" src="assets/nocomment.png">
                    </div>
                `
            }
        });
}

const loadCommentPage = () => {
    const page = document.querySelector(".page-container");

    const prefilledName = window.localStorage.username ? window.localStorage.username : "";
    const prefilledSite = window.localStorage.usersite ? window.localStorage.usersite : "";
    let html = `
        <div class="social-header">
            <text class="largefont blackfont titlefont">Share Your Thoughts</text>
            <div class="social-header-subscript smallfont semiblackfont">
                Be nice, be professional, be cool.
            </div>
            <hr>
        </div>

        <div>
            <div class="comment-form-container midfont" style="border: solid var(--shadow);" id="newcommentform">
            <div class="comment-form-top">
                <input name="name" type="text" placeholder="name*" maxLength="30" value="${prefilledName}">
                <input name="link" type="text" placeholder="website (http://)" value="${prefilledSite}">
            </div>
            <textarea placeholder="Leave a friendly comment here..."></textarea>
            <div class="comment-form-bottom">
                <a onclick="clearCommentBox('newcommentform');">Cancel</a>
                <a onclick="sendComment('newcommentform', '', 'others', true)">Send</a>
            </div>
            </div>
        </div>

        <div class="social-header">
            <text class="largefont blackfont titlefont">Comments</text>
            <div class="social-header-subscript smallfont semiblackfont">
                Meet, chat & connect with new people.
            </div>
            <hr>
        </div>

        <div class="comment-page-container">

    `

    var header = new Headers();
    header.append("Content-Type", "application/json");
    var requestOptions = {
        method: 'POST',
        headers: header,
        body: JSON.stringify({}),
        redirect: 'follow'
    };
    fetch(`${serverURL}/getAllComments`, requestOptions)
        .then(response => response.json())
        .then(data => {
            let comments = data.comments;
            const minTime = (section => {
                let min = 99999999999999;
                for (let commentID in section.sectionComment) {
                    if (section.sectionComment[commentID].time < min) {
                        min = section.sectionComment[commentID].time;
                    }
                }
                return min;
            });

            comments = comments.map(c => ({
                time: minTime(c),
                title: c.title,
                blogID: c.blogID,
                sectionComment: c.sectionComment
            }));
            comments.sort((a, b) => b.time - a.time);

            let totalPage = Math.ceil(comments.length / 5);
            let pageNumber = parseQueryString().page;
            pageNumber = Math.max(pageNumber, 1);
            pageNumber = Math.min(totalPage, pageNumber);
            comments = comments.slice((pageNumber-1)*5, pageNumber*5);

            if (comments.length == 0) {
                html += `
                <div class="midfont" style="margin: 5vh auto;display:flex;flex-direction:column;align-items:center;">
                    No comments yet. Be the first one to leave a mark on this page
                    <img style="height: 50vh;" src="assets/nocomment.png">
                </div>
            `;
            }

            comments.forEach(comment => {
                let sectionComment = comment.sectionComment;
                let referBlogs = {
                    refer: !(comment.blogID == "others"),
                }
                referBlogs.title = referBlogs.refer ? (
                    comment.title.split(" ") <= 4 ? comment.title : comment.title.split(" ").slice(0,4).join(" ") + " ..."
                ) : "";
                html += createSectionComment(sectionComment, comment.blogID, referBlogs, true);
            })
            html += `</div>`
            page.innerHTML = html;
            createPagination(pageNumber, totalPage);
        });
}