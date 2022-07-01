const skills = {
    "python-bar": 90,
    "java-bar": 75,
    "c-bar": 70,
    "html-bar": 90,
    "node-bar": 75,
    "react-bar": 70,
    "mysql-bar": 80,
    "solidity-bar": 80,
    "aws-bar": 60
}

window.onload = () => {
    let skillbars = document.querySelectorAll(".skill-bar-inner");
    const loadSkillBars = () => {
        skillbars.forEach(bar => {
            bar.style.width = `${skills[bar.id]}%`
        });
    }
    if (window.innerWidth < 992) {
        // Function to check if skillbar element is in viewport
        const elementInViewport = (e) => {
            var rect = e.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        let loaded = false;

        // Check if skill bars are initially in the viewport, if so load immediately
        let initiallyVisible = false;
        skillbars.forEach(bar => {
            initiallyVisible = initiallyVisible || elementInViewport(bar);
        })
        if (initiallyVisible) {
            loaded = true;
            loadSkillBars();
        }

        // If skill bars initially not visible, then load when it scrolls into view
        window.addEventListener('scroll', () => {
            if (!loaded && elementInViewport(skillbars[0])) {
                loaded = true;
                loadSkillBars()
            }
        });
    } else {
        loadSkillBars()
    }
}