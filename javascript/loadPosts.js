// Create the pagination indicator
const createPagination = (currPage, totalPage) => {
    if (totalPage <= 1) {
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
        <img class="eight-five-img" src="/images/${blogPost.blogID}/thumbnail.png">
        <text class="titlefont largefont">${blogPost.title}</text>
        <text class="semiblackfont smallfont">${blogPost.datealt}</text>
        <hr>
        <div class="semiblackfont midfont">
            ${brief}            
        </div>
        <a href="content?blogID=${blogPost.blogID}">
            <button class="blog-details-btn midfont whitefont">Read More &#x2192;</button>
        </a>
    </div>
    `

    return html;
}

// Create the html template for search result post
const highlightFilter = (text, filter) => {
    const insertHighlights = (text, filter) => {
        const filterLength = filter.length;
        const idx = Array.from(text.toLowerCase().matchAll(filter.toLowerCase())).map(i => i.index);
        idx.reverse();
        for (let i of idx) {
            text = `${text.substring(0, i)}<mark>${text.substring(i, i+filterLength)}</mark>${text.substring(i+filterLength)}`;
        }
        return text;
    }
    let tags = Array.from(text.matchAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g)).map(tag => tag[0]);
    // Create a map between original html tags and tags after insert highlights
    tags = tags.map(tag => ({
        original: tag,
        highlighted: insertHighlights(tag, filter)
    }));
    // Insert highlights
    text = insertHighlights(text, filter)
        // Restore original tags
    tags.forEach(tag => {
        text = text.replaceAll(tag.highlighted, tag.original);
    });
    return text;
}

const createSearchProject = (searchProject, filter) => {
    let matches = searchProject.match;
    let projectPost = searchProject.data;

    let title = projectPost.title;
    if (matches.includes("title")) {
        title = highlightFilter(title, filter);
    }

    let skills = [];
    projectPost.skills.forEach(skill => {
        if (skill.split(' ').map(s => s.toLowerCase()).includes(filter.toLowerCase())) {
            skills.push(`
            <div style="background-color:yellow;">
                <img src="assets/${skill}.png" title="${skill}">
            </div>
            `)
        } else {
            skills.push(`<div><img src="assets/${skill}.png" title="${skill}"></div>`);
        }
    });
    skills = skills.join("");

    let description = projectPost.description;
    if (matches.includes("description")) {
        for (let i = 0; i < description.length; i++) {
            description[i] = highlightFilter(description[i], filter);
        }
    }
    description = description.map(d => `<p>${d}</p>`)
    description = description.join("");

    let dates = projectPost.dates;
    if (matches.includes("dates")) {
        dates = highlightFilter(dates, filter);
    }

    let html = `
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
    let matches = searchBlog.match;
    let blogPost = searchBlog.data;
    let content = blogPost.content;
    let date = blogPost.date.toString();
    date = "Posted on " + date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);

    let title = blogPost.title;
    if (matches.includes("title")) {
        title = highlightFilter(title, filter);
    }

    let datealt = blogPost.datealt;
    if (matches.includes("datealt")) {
        datealt = highlightFilter(datealt, filter);
    }

    let brief = [];
    if (!matches.includes("date") && !matches.includes("content")) {
        if (matches.includes("brief")) {
            brief = blogPost.brief.map(paragraph => `<p>${highlightFilter(paragraph, filter)}</p>`);
        } else {
            brief = blogPost.brief.map(paragraph => `<p>${paragraph}</p>`)
        }
        brief = brief.join("");
    } else {
        if (matches.includes("content")) {
            let index = 0;
            while (index < content.length) {
                let paragraph = content[index].type == "text" ? content[index].source : "... ...(" + content[index].description + ")";
                paragraph = highlightFilter(paragraph, filter);
                if (paragraph.toLowerCase().includes(`<mark>${filter.toLowerCase()}</mark>`)) {
                    brief.push(paragraph)
                    break;
                }
                index++;
            }

            // Add succeeding paragraphs in the content to make up enough length displayed
            let preceding = index > 0;
            let succeeding = index < content.length - 1;
            if (preceding) {
                let paragraph = content[index-1].type == "text" ? content[index-1].source : "... ...(" + content[index-1].description + ")";
                brief.unshift(highlightFilter(paragraph, filter));
                if (!succeeding && index - 2 >= 0) {
                    paragraph = content[index-2].type == "text" ? content[index-1].source : "... ...(" + content[index-2].description + ")";
                    brief.unshift(highlightFilter(paragraph, filter));
                }
            }
            // Add preceding paragraphs in the content to make up enough length displayed
            if (succeeding) {
                let paragraph = content[index+1].type == "text" ? content[index+1].source : "... ...(" + content[index+1].description + ")";
                brief.push(highlightFilter(paragraph, filter));
                if (!preceding && index + 2 < content.length) {
                    paragraph = content[index+2].type == "text" ? content[index+2].source : "... ...(" + content[index+2].description + ")";
                    brief.push(highlightFilter(paragraph, filter));
                }
            }
        } else {
            date = highlightFilter(date, filter);
            brief.push(date);
            // Add succeeding paragraphs in the content to make up enough length displayed
            for (let index = 0; index < Math.min(2, content.length); index++) {
                let paragraph = content[index].type == "text" ? content[index].source : "... ...(" + content[index].description + ")";
                brief.push(highlightFilter(paragraph, filter));
            } 
        }
        brief = brief.map(paragraph => `<p>${paragraph}</p>`).join("");
    }


    let html = `
    <div class="post-container">
        <img class="eight-five-img" src="/images/${blogPost.blogID}/thumbnail.png">
        <text class="titlefont largefont">${title}</text>
        <text class="semiblackfont smallfont">${datealt}</text>
        <hr>
        <div class="semiblackfont midfont">
            ${brief}
        </div>
        <a href="content?blogID=${blogPost.blogID}">
            <button class="blog-details-btn midfont whitefont">Read More &#x2192;</button>
        </a>
    </div>
    `
    return html;
}

const createSearchResult = (searchResult, filter) => {
    if (searchResult.type == "project") {
        return createSearchProject(searchResult, filter);
    } else if (searchResult.type == "blog") {
        return createSearchBlog(searchResult, filter);
    }
}

const createNoResult = () => {
    let html = `
        <div class="no-result-container">
            <img src="assets/noresult.png">
            <text class="semiblackfont largefont">Oops, no posts found...</text>
        </div>
    `
    const page = document.querySelector('.page-container');
    page.innerHTML += html;
}

// Create an entire page of activity/project posts
const loadPosts = (posts, pageType, filter) => {
    if (pageType == "search" && posts.length == 0) {
        createNoResult();
        return;
    }
    const page = document.querySelector('.page-container');
    page.innerHTML = "";
    posts.forEach(post => {
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
        "page": currPage,
        "filter": filter
    });
    var requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
    };

    var postUrl;
    var postKey;
    if (pageType == "projects") {
        postUrl = "http://127.0.0.1:3000/getProjects";
        postKey = "projects";
    } else if (pageType == "blogs") {
        postUrl = "http://127.0.0.1:3000/getBlogs";
        postKey = "blogs";
    } else if (pageType == "search") {
        postUrl = "http://127.0.0.1:3000/search";
        postKey = "matches"
    } else {
        return;
    }
    fetch(postUrl, requestOptions)
        .then(response => response.json())
        .then(data => {
            currPage = data.page;
            let totalPage = data.totalPages;
            let displayedPosts = data[postKey];
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