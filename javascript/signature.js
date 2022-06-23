const canvasWidth = 750;
const canvasHeight = 250;
const speed = 20;
const penColor = 'black';

let signatureCanvas = document.getElementById("signature-canvas");
signatureCanvas.width = canvasWidth;
signatureCanvas.height = canvasHeight;
let signatureCtx = signatureCanvas.getContext('2d');
let strokeIdx = 0;
let startWritting = 10;

window.addEventListener('resize', () => {
    // signatureCanvas.width = window.innerWidth;
    // signatureCanvas.height = window.innerHeight;
});

let originalWidth = strokeData.width;
let strokeRatio = canvasWidth / originalWidth;
let penRadius = strokeData.radius * strokeRatio;
let strokes = strokeData.strokes;

function animateSignature() {
    if (startWritting > 0) {
        startWritting--;
        requestAnimationFrame(animateSignature)
    } else {

        for (let speedCounter = 0; speedCounter < speed; speedCounter++) {
            let strokeX = strokes[strokeIdx][0] * strokeRatio;
            let strokeY = strokes[strokeIdx][1] * strokeRatio;
            strokeIdx++;
            signatureCtx.beginPath();
            signatureCtx.arc(strokeX, strokeY, penRadius, 0, Math.PI * 2, false);
            signatureCtx.strokeStyle = penColor;
            signatureCtx.stroke();
            signatureCtx.fillStyle = penColor;
            signatureCtx.fill();
            if (strokeIdx >= strokes.length) {
                break;
            }
        }

        if (strokeIdx < strokes.length) {
            requestAnimationFrame(animateSignature);
        } else {
            let introDescription = document.getElementById("intro-descriptor");;
            introDescription.style.opacity = 1;
        }
    }

}
animateSignature();