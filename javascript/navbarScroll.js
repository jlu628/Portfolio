let prevScroll = 0;

window.addEventListener('scroll', () => {
    const navbar = document.getElementsByClassName('navbar-container')[0];
    let navHeight = window.getComputedStyle(navbar).height;
    navHeight = parseInt(navHeight.substring(0, navHeight.indexOf('px')))
    let currScroll = window.pageYOffset;
    if (prevScroll > currScroll) {
        navbar.style.top = "0";
    } else {
        if (currScroll > navHeight) {
            navbar.style.top = `-${navHeight}px`;
        }
    }
    if (navbar.classList.contains('transparent')) {
        if (currScroll > navHeight) {
            navbar.style.backgroundColor = 'white';
        } else {
            navbar.style.backgroundColor = 'transparent';
        }
    }
    prevScroll = currScroll;
})