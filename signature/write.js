const canvasWidth = 600;
const canvasHeight = 200;
const speed = 7;
const penColor = 'black';

let signatureCanvas = document.querySelector("canvas");
signatureCanvas.width = canvasWidth;
signatureCanvas.height = canvasHeight;
let c = signatureCanvas.getContext('2d');
let i = 0;

let width = strokeData.width;
let height = strokeData.height;
let ratio = canvasWidth / width;
let penRadius = strokeData.radius * ratio;
let strokes = strokeData.strokes;

function animate() {
    for (let j = 0; j < speed; j++) {
        let x = strokes[i][0] * ratio;
        let y = strokes[i][1] * ratio;
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

animate();