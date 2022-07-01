const items = document.querySelectorAll("#homeCarousel > .carousel-inner > .item");

fetch("../blogs/meta.json")
    .then(response => response.json())
    .then(blogsMeta => {
        const blogDates = Object.keys(blogsMeta).map(k => parseInt(k));
        blogDates.sort((a, b) => b - a);
        for (let i = 0; i < 4; i++) {
            const item = items[i];
            const date = blogDates[i];
            const blog = blogsMeta[date];
            item.innerHTML = `                
            <a href="#">
                <img src="${blog.thumbnail}">
            </a>
            <div class="carousel-descriptor smallfont grayfont centertext">
                ${blog.summary}
            </div>
        `
        }
    });