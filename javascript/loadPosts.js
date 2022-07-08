// Create the pagination indicator
const createPagination = (currPage, totalPage) => {
    if (totalPage == 1) {
        document.querySelector('.pagination-container').style.display = 'none';
        return;
    }

    // Create page numbers to be displayed
    let displayedPageNumbers;
    if (totalPage <= 7) {
        displayedPageNumbers = [...Array(totalPage + 1).keys()].slice(1);
    } else {
        if (currPage < 3) {
            displayedPageNumbers = [1, 2, 3, "...", totalPage];
        } else if (currPage == 3) {
            displayedPageNumbers = [1, 2, 3, 4, "...", totalPage];
        } else if (currPage > totalPage - 2) {
            displayedPageNumbers = [1, "...", totalPage - 2, totalPage - 1, totalPage];
        } else if (currPage == totalPage - 2) {
            displayedPageNumbers = [1, "...", totalPage - 3, totalPage - 2, totalPage - 1, totalPage];
        } else {
            displayedPageNumbers = [1, "...", currPage - 1, currPage, currPage + 1, "...", totalPage];
        }
    }

    // Write HTML into pagination indicator
    let prevHref = currPage == 1 ? "" : `href="${appendQueryString("page", currPage-1)}"`;
    let nextHref = currPage == totalPage ? "" : `href="${appendQueryString("page",currPage+1)}"`;
    let html = `
    <ul class="pagination justify-content-center">
        <li class="page-item ${currPage == 1 ? "disabled" : "clickable"}">
            <a class="page-link"} aria-label="Previous" ${prevHref}>
                <span aria-hidden="true">&laquo;</span>
                <span class="sr-only">Previous</span>
            </a>
        </li>
    `;
    displayedPageNumbers.forEach(pageNumber => {
        html += `
        <li class="page-item ${pageNumber == "..." ? "disabled": "clickable"}">
            <a class="page-link" ${pageNumber == currPage ? 'style="text-decoration: underline"' : ""} href="${appendQueryString("page", pageNumber)}">${pageNumber}</a>
        </li>
        `
    });
    html += `
        <li class="page-item ${currPage == totalPage ? "disabled" : "clickable"}">
            <a class="page-link" aria-label="Next" ${nextHref}>
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Next</span>
            </a>
        </li>
    </ul>
    `
    const pagination = document.querySelector('.pagination-container');
    pagination.innerHTML = html;
}

// Create the html template for project page posts
const createProject = (projectPost) => {
    let skills = "";
    projectPost.skills.forEach(skill => {
        skills += `<div><img src="assets/${skill}.png" title="${skill}"></div>`
    });
    let descriptions = "";
    projectPost.description.forEach(paragraph => {
        descriptions += `<p>${paragraph}</p>`
    });

    let html = `
    <div class="post-container">
        <img class="two-one-img" src=${projectPost.thumbnail}>
        <text class="titlefont largefont">${projectPost.title}</text>
        <text class="semiblackfont smallfont">${projectPost.dates}</text>
        <hr>
        <div class="project-icon-container">
            ${skills}
        </div>
        <div class="semiblackfont midfont">
            ${descriptions}
        </div>
        <a href=${projectPost.link} target="_blank">
            <button class="project-details-btn midfont whitefont">Demo &#x2192;</button>
        </a>
    </div>
    `

    return html;
}

// Create the html template for blog page posts
const createBlog = (blogPost) => {
    let brief = "";
    blogPost.brief.forEach(paragraph => {
        brief += `<p>${paragraph}</p>`
    });

    let html = `
    <div class="post-container">
        <img class="eight-five-img" src="blogs/images/${blogPost.blogID}/thumbnail.png">
        <text class="titlefont largefont">${blogPost.title}</text>
        <text class="semiblackfont smallfont">${blogPost.datealt}</text>
        <hr>
        <div class="semiblackfont midfont">
            ${brief}            
        </div>
        <a href="content.html?blogID=${blogPost.blogID}">
            <button class="blog-details-btn midfont whitefont">Read More &#x2192;</button>
        </a>
    </div>
    `

    return html;
}

// Create the html template for search result post
const insertHighlights = (text, length, idx) => {
    if (!idx || idx.length == 0) {
        return text;
    }
    let textArray = [];
    for (let i = 0; i < idx.length - 1; i++) {
        textArray.push(text.substring(idx[i], idx[i + 1]));
    }
    textArray.push(text.substring(idx[idx.length - 1], text.length));
    textArray = textArray.map(t => `<mark>${t.substring(0, length)}</mark>${t.substring(length)}`);
    return text.substring(0, idx[0]) + textArray.join("");
}

const createSearchProject = (searchProject, filter) => {
    let matches = searchProject.matches;
    let projectPost = searchProject.post;

    let title = projectPost.title;
    if (matches.title) {
        title = insertHighlights(title, filter.length, matches.title.idx);
    }

    let skills = [];
    projectPost.skills.forEach(skill => {
        skills.push(`<div><img src="assets/${skill}.png" title="${skill}"></div>`);
    });
    if (matches.skills) {
        skills[matches.skills.idx] = `
        <div style="background-color:yellow;">
        <img src="assets/${projectPost.skills[matches.skills.idx]}.png" title="${projectPost.skills[matches.skills.idx]}">
        </div>
        `;
    }
    skills = skills.join("");

    let description = projectPost.description;
    if (matches.description) {
        for (let i = 0; i < description.length; i++) {
            description[i] = insertHighlights(description[i], filter.length, matches.description.idx[i]);
        }
    }
    description = description.map(d => `<p>${d}</p>`)
    description = description.join("");

    let dates = projectPost.dates;
    if (matches.dates) {
        dates = insertHighlights(dates, filter.length, matches.dates.idx);
    }

    html = `
    <div class="post-container">
        <img class="two-one-img" src=${projectPost.thumbnail}>
        <text class="titlefont largefont">${title}</text>
        <text class="semiblackfont smallfont">${dates}</text>
        <hr>
        <div class="project-icon-container">
            ${skills}
        </div>
        <div class="semiblackfont midfont">
            ${description}
        </div>
        <a href=${projectPost.link} target="_blank">
            <button class="project-details-btn midfont whitefont">Demo &#x2192;</button>
        </a>
    </div>
    `;
    return html
}

const createSearchBlog = (searchBlog, filter) => {
    let matches = searchBlog.matches;
    let blogPost = searchBlog.post;
    let blogContent = searchBlog.content;

    let title = blogPost.title;
    if (matches.title) {
        title = insertHighlights(title, filter.length, matches.title.idx);
    }

    let datealt = blogPost.datealt;
    if (matches.datealt) {
        datealt = insertHighlights(datealt, filter.length, matches.datealt.idx);
    }

    let brief;
    if (!matches.content) {
        brief = blogPost.brief;
        if (matches.brief) {
            for (let i = 0; i < brief.length; i++) {
                brief[i] = insertHighlights(brief[i], filter.length, matches.brief.idx[i]);
            }
        }
        brief = brief.map(b => `<p>${b}</p>`)
        brief = brief.join("");
    } else {
        contentBrief = blogContent.content;
        contentBrief = contentBrief.map(b => (typeof b === 'string' || b instanceof String) ? b : b.desc);
        let date = blogPost.date
        date = "Posted on " + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
        contentBrief.unshift(date);

        let wordCount = 0;
        let paragraphCount = 0;
        let highlightedIdx = [];
        for (let i = 0; i < contentBrief.length; i++) {
            if (matches.content.idx[i].length > 0) {
                paragraphCount += 1;
                wordCount += contentBrief[i].split(" ").length;
                highlightedIdx.push(i);
            }
            if (paragraphCount >= 3 || wordCount >= 150) {
                break;
            }
        }
        let addWordParagraphs = highlightedIdx[0];
        while (addWordParagraphs < contentBrief.length && wordCount < 100 && paragraphCount < 3) {
            if (!highlightedIdx.includes(addWordParagraphs)) {
                paragraphCount += 1;
                wordCount += contentBrief[addWordParagraphs].split(" ").length;
                highlightedIdx.push(addWordParagraphs);
            }
            addWordParagraphs++;
        }

        addWordParagraphs = 0;
        while (addWordParagraphs < highlightedIdx[0] && wordCount < 100 && paragraphCount < 3) {
            if (!highlightedIdx.includes(addWordParagraphs)) {
                paragraphCount += 1;
                wordCount += contentBrief[iaddWordParagraphs].split(" ").length;
                highlightedIdx.push(addWordParagraphs);
            }
            addWordParagraphs++;
        }

        displayedContent = [];
        highlightedIdx.sort();
        for (let i = 0; i < highlightedIdx.length; i++) {
            let currIdx = highlightedIdx[i];
            displayedContent.push(insertHighlights(contentBrief[currIdx], filter.length, matches.content.idx[currIdx]));
            if ((i < highlightedIdx.length - 1 && highlightedIdx[i + 1] - currIdx > 1) ||
                (i == highlightedIdx.length - 1 && currIdx < contentBrief.length - 1)) {
                displayedContent.push(" ... ");
            }
        }

        brief = displayedContent.map(b => `<p>${b}</p>`)
        brief = brief.join("");
    }


    let html = `
    <div class="post-container">
        <img class="eight-five-img" src="blogs/images/${blogPost.blogID}/thumbnail.png">
        <text class="titlefont largefont">${title}</text>
        <text class="semiblackfont smallfont">${datealt}</text>
        <hr>
        <div class="semiblackfont midfont">
            ${brief}
        </div>
        <a href="content.html?blogID=${blogPost.blogID}">
            <button class="blog-details-btn midfont whitefont">Read More &#x2192;</button>
        </a>
    </div>
    `
    return html;
}

const createSearchResult = (searchResult, filter) => {
    if (searchResult.type == "projects") {
        return createSearchProject(searchResult, filter);
    } else if (searchResult.type == "blogs") {
        return createSearchBlog(searchResult, filter);
    }
}

// Create an entire page of activity/project posts
const loadPosts = (posts, pageType, filter) => {
    const page = document.querySelector('.page-container');
    page.innerHTML = "";
    posts.forEach(post => {
        let html;
        if (pageType == "projects") {
            html = createProject(post);
        } else if (pageType == "blogs") {
            html = createBlog(post);
        } else if (pageType == "search") {
            html = createSearchResult(post, filter);
        }
        page.innerHTML += html;
    });
}

// Load entire page of activity/project posts and create pagination as needed
const loadPostPage = (currPage, pageType, filter) => {
    var header = new Headers();
    header.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "type": pageType,
        "page": currPage,
        "filter": filter
    });
    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };
    fetch("http://127.0.0.1:3000/getPostPage", requestOptions)
        .then(response => response.json())
        .then(data => {
            currPage = data.page;
            let totalPage = data.totalPages;
            let displayedPosts = data.displayedPosts;
            loadPosts(displayedPosts, pageType, filter);
            createPagination(currPage, totalPage);

            // Create pagination indicator
            if (displayedPosts.length % 2 == 0) {
                document.querySelector('.pagination-container').style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--gray-semi-transparent');;
            }
        })
        .catch(error => console.log('error', error));
}

// When window first loaded
const loadPage = (type) => {
    const query = parseQueryString();
    loadPostPage(parseInt(query.page) || 1, type, query.filter);
}

window.addEventListener("resize", () => {
    if (window.innerWidth < 650) {
        let pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.classList.add("pagination-sm");
        }
    } else {
        let pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.classList.remove("pagination-sm");
        }
    }
})