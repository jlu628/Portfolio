const items = document.querySelectorAll("#homeCarousel > .carousel-inner > .item");

const loadBlogHome = () => {
    fetch("../blogs/meta.json")
        .then(response => response.json())
        .then(blogsMeta => {

            blogsMeta.blogs.sort((a, b) => parseInt(b.date) - parseInt(a.date));
            for (let i = 0; i < 4; i++) {
                const blog = blogsMeta.blogs[i];
                const item = items[i];
                const blogID = hash(blog.name + blog.date)
                item.innerHTML = `                
            <a href="content.html?blogID=${blogID}">
                <img src="blogs/images/${blogID}/thumbnail.png">
            </a>
            <div class="carousel-descriptor smallfont grayfont centertext">
                ${blog.summary}
            </div>
        `
            }
        });
}