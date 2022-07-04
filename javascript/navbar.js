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
});

document.getElementById("small-device-navbar-opener").childNodes[0].onclick = () => {
    document.querySelector(".navbar>div:nth-child(2)").style.left = "0px";
    document.getElementById("small-device-background-cover").style.display = "block";
}

document.getElementById("small-device-background-cover").addEventListener("mousedown", () => {
    const navPanel = document.querySelector(".navbar>div:nth-child(2)");
    console.log(`${navPanel.style}`);
    navPanel.style.left = `-200px`;
    document.getElementById("small-device-background-cover").style.display = "none";
});

document.getElementById("small-device-background-cover").addEventListener("touchstart", () => {
    const navPanel = document.querySelector(".navbar>div:nth-child(2)");
    navPanel.style.left = `-200px`;
    document.getElementById("small-device-background-cover").style.display = "none";
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
        document.getElementById("small-device-background-cover").style.display = "none";
    }
});