const penRadius = 3;
const penColor = 'black';
const canvasWidth = 900;
const canvasHeight = 300;
let strokes = [];

let signatureCanvas = document.querySelector("canvas");
signatureCanvas.width = canvasWidth;
signatureCanvas.height = canvasHeight;
// window.addEventListener('resize', () => {
//     signatureCanvas.width = window.innerWidth;
//     signatureCanvas.height = window.innerHeight;
// });
let c = signatureCanvas.getContext('2d');

let writting = false;
let finished = false;
let mouse = {
    x: NaN,
    y: NaN
};
window.addEventListener('mousedown', (e) => {
    writting = true;
});
window.addEventListener('mouseup', () => {
    writting = false;
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Apple pencil
window.addEventListener('touchstart', (e) => {
    if (e.touches[0].touchType === 'stylus') {
        writting = true;
        let touch = e.originalEvent.touches[0]
        mouse.x = touch.pageX;
        mouse.y = touch.pageY;
    }
});
window.addEventListener('touchend', (e) => {
    if (e.touches[0].touchType === 'stylus') {
        writting = false;
    }}
);

window.addEventListener('touchmove', (event) => {
    if (event.touches[0].touchType === 'stylus') {
        let touch = e.originalEvent.changedTouches[0];
        mouse.x = touch.pageX;
        mouse.y = touch.pageY;
    }
});

const submit = async() => {
    finished = true;
    let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        "width": canvasWidth,
        "height": canvasHeight,
        "radius": penRadius,
        "strokes": strokes
    }));
    document.querySelector('body').innerHTML += '<a href="data:' + data + '" download="data.json">download Strokes</a>';
}

function animate() {
    if (writting) {
        c.beginPath();
        c.arc(mouse.x, mouse.y, penRadius, 0, Math.PI * 2, false);
        c.strokeStyle = penColor;
        c.stroke();
        c.fillStyle = penColor;
        c.fill();

        strokes.push([mouse.x, mouse.y]);
    }

    if (!finished) {
        requestAnimationFrame(animate);
    }
}
animate();