// Create the html template for project page posts
const createProject = (projectPost) => {
    let html = `
    <div class="post-container">
    <img class="two-one-img" src=${projectPost.thumbnail}>
    <text class="titlefont largefont">${projectPost.name}</text>
    <text class="semiblackfont smallfont">${projectPost.dates}</text>
    <hr>
    <div class="project-icon-container">
    `
    projectPost.skills.forEach(skill => {
        html += `<img src="assets/${skill}.png" title="${skill}">`
    });
    html += `
    </div>
    <div class="semiblackfont midfont">
    `
    projectPost.description.forEach(paragraph => {
        html += `<p>${paragraph}</p>`
    });
    html += `</div>
    <a href=${projectPost.link} target="_blank"><button class="project-details-btn midfont whitefont">Demo &#x2192;</button></a>
    </div>
    `

    return html;
}

// Create the html template for blog page posts
const createBlog = (blogPost) => {
    let html = `
    <div class="post-container">
    <img class="eight-five-img" src="blogs/images/${hash(blogPost.name + blogPost.date)}/thumbnail.png">
    <text class="titlefont largefont">${blogPost.title}</text>
    <text class="semiblackfont smallfont">${blogPost.datealt}`
    blogPost.tags.forEach(tag => {
        html += `<a href="${appendQueryString("tag", tag)}"> #${tag}</a>`
    });

    html += `</text>
    <hr>
    <div class="semiblackfont midfont">
    `;
    blogPost.brief.forEach(paragraph => {
        html += `<p>${paragraph}</p>`
    });
    html += `            
    </div>
    <a href="content.html?blogID=${hash(blogPost.name + blogPost.date)}">
        <button class="blog-details-btn midfont whitefont">Read More &#x2192;</button>
    </a>
    </div>
    `

    return html;
}

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

// Create an entire page of activity/project posts
const loadPosts = (posts, pageType) => {
    const page = document.querySelector('.page-container');
    page.innerHTML = "";
    posts.forEach(post => {
        let html;
        if (pageType == "projects") {
            html = createProject(post);
        } else {
            html = createBlog(post);
        }
        page.innerHTML += html;
    });
}

// Load entire page of activity/project posts and create pagination as needed
const loadPostPage = (currPage, pageType, tag, filter) => {
    fetch("../blogs/meta.json")
        .then(response => response.json())
        .then(metadata => {
            // Filter useful posts
            data = metadata[pageType];
            // Load posts
            if (tag) {
                data = data.filter(blog => blog.tags.includes(tag));
            }
            // Sanity check
            let totalPage = Math.ceil(data.length / 5);
            currPage = currPage < 0 ? 1 : Math.min(currPage, totalPage)

            const displayedPosts = data.slice((currPage - 1) * 5, currPage * 5);
            loadPosts(displayedPosts, pageType);
            createPagination(currPage, totalPage);

            // Create pagination indicator
            if (displayedPosts.length % 2 == 0) {
                document.querySelector('.pagination-container').style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--gray-semi-transparent');;
            }
        });
}

// When window first loaded
const loadPage = (type) => {
    const query = parseQueryString();
    loadPostPage(parseInt(query.page) || 1, type, query.tag, query.filter);
}

window.addEventListener("resize", () => {
    if (window.innerWidth < 650) {
        let pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.classList.add("pagination-sm");
        }
        console.log(pagination.classList)
    } else {
        let pagination = document.querySelector(".pagination");
        if (pagination) {
            pagination.classList.remove("pagination-sm");
        }
        console.log(pagination.classList)

    }
})