// Create the html for a single project's information
const createProject = (projectName, project) => {
    let html = `
    <div class="summary-container">
    <img src=${project.thumbnail}>
    <text class="titlefont largefont">${projectName}</text>
    <text class="semiblackfont smallfont">${project.dates}</text>
    <hr>
    <div class="summary-icon-container">
    `
    project.skills.forEach(skill => {
        html += `<img src="assets/${skill}.png" title="${skill}">`
    });
    html += `
    </div>
    <div class="semiblackfont midfont">
    `
    project.description.forEach(paragraph => {
        html += `<p>${paragraph}</p>`
    });
    html += `</div>
    <a href=${project.link} target="_blank"><button class="midfont whitefont">Demo &#x2192;</button></a>
    </div>
    `

    return html;
}

// Create an entire page of projects
const loadProjects = (projectNames, projects) => {
    const page = document.querySelector('.page-container');
    page.innerHTML = "";
    projectNames.forEach(projectName => {
        page.innerHTML += createProject(projectName, projects[projectName])
    });
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
    let html = `
    <ul class="pagination justify-content-center">
        <li class="page-item ${currPage == 1 ? "disabled" : "clickable"}" onClick="clickPage(${currPage == 1 ? false : currPage-1})">
            <a class="page-link"} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
                <span class="sr-only">Previous</span>
            </a>
        </li>
    `;
    displayedPageNumbers.forEach(pageNumber => {
        html += `
        <li class="page-item ${pageNumber == "..." ? "disabled": "clickable"}" onClick="clickPage(${pageNumber == "..." ? false : pageNumber})">
            <a class="page-link" ${pageNumber == currPage ? 'style="text-decoration: underline"' : ""}>${pageNumber}</a>
        </li>
        `
    });
    html += `
        <li class="page-item ${currPage == totalPage ? "disabled" : "clickable"}" onClick="clickPage(${currPage == totalPage ? false : currPage+1})">
            <a class="page-link" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Next</span>
            </a>
        </li>
    </ul>
    `
    const pagination = document.querySelector('.pagination-container');
    pagination.innerHTML = html;
}

// Load entire page of projects and pagination
const loadPage = (currPage) => {
    fetch("../projects/meta.json")
        .then(response => response.json())
        .then(projects => {
            // Load projects
            const projectNames = Object.keys(projects);
            const displayedProjectNames = projectNames.slice((currPage - 1) * 5, currPage * 5);
            loadProjects(displayedProjectNames, projects);

            // Create pagination indicator
            let totalPage = Math.ceil(projectNames.length / 5)
            createPagination(currPage, totalPage);
            if (displayedProjectNames.length % 2 == 0) {
                document.querySelector('.pagination-container').style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--gray-semi-transparent');;
            }
        });
}

// Load a new page of project and update pagination indication when new page number clicked
const clickPage = (pageNumber) => {
    if (!pageNumber) {
        return;
    }
    loadPage(pageNumber);
    window.scrollTo(0, 0);
}

// When window first loaded
window.onload = () => {
    loadPage(1);
}