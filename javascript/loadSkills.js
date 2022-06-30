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
    skillbars.forEach(bar => {
        bar.style.width = `${skills[bar.id]}%`
    });
}