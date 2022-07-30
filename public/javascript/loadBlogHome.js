const loadBlogHome = () => {
    const items = document.querySelectorAll("#homeCarousel > .carousel-inner > .item");

    var header = new Headers();
    header.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'POST',
        headers: header,
        body: JSON.stringify({}),
        redirect: 'follow'
    };

    fetch(`http://${serverURL}/getRecentBlogs`, requestOptions)
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < 4; i++) {
                const blog = data.data[i];
                const item = items[i];
                const blogID = blog.blogID;

                item.innerHTML = `                
                <a href="content?blogID=${blogID}">
                    <img src="/images/${blogID}/thumbnail.png">
                </a>
                <div class="carousel-descriptor smallfont grayfont centertext">
                    ${blog.summary}
                </div>
            `
            }
        })
        .catch(error => console.log('error', error));
}