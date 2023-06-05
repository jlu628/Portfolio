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

signatureCanvas.addEventListener('touchmove', (event) => {
    writting = true;
    for(var i = 0; i < event.touches.length; i++){
        if(event.touches[i].touchType === "stylus"){
            mouse.x = event.touches[i].clientX;
            mouse.y =  event.touches[i].clientY;
        }
    }
    writting = false;
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
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