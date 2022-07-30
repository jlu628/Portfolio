const canvasWidth = 600;
const canvasHeight = 200;
const speed = 7;
const penColor = 'black';

let signatureCanvas = document.querySelector("canvas");
signatureCanvas.width = canvasWidth;
signatureCanvas.height = canvasHeight;
let c = signatureCanvas.getContext('2d');
let i = 0;

let strokeRatio, penRadius, strokes;

function animate() {
    for (let j = 0; j < speed; j++) {
        let x = strokes[i][0] * strokeRatio;
        let y = strokes[i][1] * strokeRatio;
        i++;
        c.beginPath();
        c.arc(x, y, penRadius, 0, Math.PI * 2, false);
        c.strokeStyle = penColor;
        c.stroke();
        c.fillStyle = penColor;
        c.fill();
        if (i >= strokes.length) {
            break;
        }
    }

    if (i < strokes.length) {
        requestAnimationFrame(animate);
    }
}

fetch("./data.json")
    .then(response => response.json())
    .then(strokeData => {
        let originalWidth = strokeData.width;
        strokeRatio = canvasWidth / originalWidth;
        penRadius = strokeData.radius * strokeRatio;
        strokes = strokeData.strokes;

        animate();
    });