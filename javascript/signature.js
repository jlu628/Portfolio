const canvasWidth = window.innerWidth > 750 ? 750 : window.innerWidth;
const canvasHeight = canvasWidth / 3;
const speed = 20;
const penColor = '#425362';

let signatureCanvas = document.getElementById("signature-canvas");
signatureCanvas.width = canvasWidth;
signatureCanvas.height = canvasHeight;
let signatureCtx = signatureCanvas.getContext('2d');
let strokeIdx = 0;
let startWritting = 10;

let strokeRatio, penRadius, strokes;

window.addEventListener('resize', () => {
    let ratio = window.innerWidth / canvasWidth;
    if (Math.ceil(canvasWidth * ratio) <= Math.min(window.innerWidth, 750)) {
        signatureCanvas.style.transform = `scale(${ratio}, ${ratio})`;
    }
});

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
            let headerDescriptors = document.querySelectorAll("#header-descriptor > span");
            let headerDescriptorIdx = 0;
            headerDescriptors[headerDescriptorIdx].style.opacity = 1;
            headerDescriptorIdx++;
            let headerDescriptorIntervalID = setInterval(() => {
                headerDescriptors[headerDescriptorIdx].style.opacity = 1;
                if (++headerDescriptorIdx === 4) {
                    window.clearInterval(headerDescriptorIntervalID);
                }
            }, 800);
        }
    }

}

fetch("../assets/ENStroke.json")
    .then(response => response.json())
    .then(strokeData => {
        let originalWidth = strokeData.width;
        strokeRatio = canvasWidth / originalWidth;
        penRadius = strokeData.radius * strokeRatio;
        strokes = strokeData.strokes;

        animateSignature();
    });