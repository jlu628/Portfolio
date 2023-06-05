// const serverURL = "https://jiayu-lu.com/"
const serverURL = "http://127.0.0.1:3000"

window.onload = function() {
    var passwordInput = document.getElementById("password");
    var submitButton = document.getElementById("submit");
    passwordInput.addEventListener("keydown", function(event) {
        if (event.key == "Enter") {
            submitButton.click();
        }
    });
    document.getElementById("password").value = window.localStorage.password ? window.localStorage.password : "";

    // Verify if token exists
    if (window.localStorage.token) {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        const body = JSON.stringify({
            "token": window.localStorage.token
        });
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: body,
            redirect: 'follow'
        };
        fetch("".concat(serverURL, "/admin/verify"), requestOptions)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    managedData = data.managedData;
                    loadManagedData();
                }
            })["catch"](function(error) { return console.log('error', error); });
    }
};

const submitPassword = function() {
    const passwordInput = document.getElementById("password").value;
    window.localStorage.password = passwordInput;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const body = JSON.stringify({
        "password": passwordInput
    });
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: body,
        redirect: 'follow'
    };
    console.log("".concat(serverURL, "/admin/login"))
    fetch("".concat(serverURL, "/admin/login"), requestOptions)
        .then((response) =>{ return response.json(); })
        .then((data) => {
            if (data.success) {
                console.log(data);
            } else {
                alert("Wrong password!")
            }
        })["catch"](function(error) { return console.log('error', error); });
};

const loadManagedData = () => {
    document.getElementById("login").style.display = "none";
    document.getElementById("managed").style.display = "block"
    document.getElementById("sync").style.display = "flex"

    // Prepare project data
    let projectData = `<text class="sectiontitle">Projects</text>`;
    managedData.projects.forEach(project => {
        projectData += `<div>
                        <text>(${project.dates})</text> <text>${project.title}</text>
                    </div>`
    });
    document.getElementById("projects").innerHTML = projectData;

    // Prepare blog data
    let blogData = `<text class="sectiontitle">Blogs</text>`;
    managedData.blogs.forEach(blog => {
        blogData += `<div>
                        <text>(${blog.datealt})</text> <text>${blog.title}</text> 
                    </div>`
    });
    document.getElementById("blogs").innerHTML = blogData;

    // Prepare comment data
    let commentData = `<text class="sectiontitle">Comments</text>`
    for (let blogID in managedData.comments) {
        let blogTitle = managedData.blogs.filter(blog => blog.blogID == blogID);
        if (blogTitle.length == 1) {
            blogTitle = blogTitle[0];
            blogTitle = `(${blogTitle.date}) &nbsp;&nbsp;&nbsp; ${blogTitle.title}`
        } else {
            blogTitle = blogID;
        }
        commentData += `<div><text class="subtitle">${blogTitle}</text>`
        managedData.comments[blogID].forEach(sections => {
            commentData += `<div class="sectionComment">`
            sections.forEach((comment, index) => {
                let time = comment.time.toString();
                time = `${time.substring(0,4)}-${time.substring(4,6)}-${time.substring(6,8)} ${time.substring(8,10)}:${time.substring(10,12)}:${time.substring(12,14)}`
                commentData += `<div class=${index > 0 ? "followupcomment" : "firstcomment"}>
                    <text></text><text>(${time})</text> <text>${comment.name}:</text> <text>${comment.content.substring(0, 50)} ${comment.content.length > 20 ? "..." : ""}</text>
                </div>`
            })
            commentData += `</div>`
        })
        commentData += `</div>`
    }
    document.getElementById("comments").innerHTML = commentData;
}

const syncLocal = () => {
    const downloadFile = (data, filename) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL( new Blob([JSON.stringify(data)], {type: 'text/json'}) );
        a.download = filename;
        a.click();
    }
    let blogs = { blogs: managedData.blogs };
    let projects = { projects: managedData.projects };
    let comments = managedData.comments;
    downloadFile(blogs, "blog.json");
    downloadFile(projects, "project.json");
    downloadFile(comments, "comment.json");
}