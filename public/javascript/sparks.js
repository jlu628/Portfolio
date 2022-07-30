let config = {
    color: [200, 240],
    opacity: [0.4, 0.6],
    size: window.innerWidth >= 600 ? [10, 40] : [10*window.innerWidth/600, 40*window.innerWidth/600],
    initVelocityVertical: [-2, 0],
    initVelocityRatio: [-0.5, 0.5],
    acceleration: [-0.005, -0.025],
    lifeTime: [100, 200],
    numSparks: window.innerWidth >= 1000 ? 50 : Math.ceil(window.innerWidth/20)
}
const getRand = (arr) => Math.random() * (arr[1] - arr[0]) + arr[0];
const getColor = (ratio) => (config.color[1] - config.color[0]) * ratio + config.color[0]

let sparkCanvas = document.getElementById('spark-canvas');
sparkCanvas.width = window.innerWidth;
sparkCanvas.height = window.innerHeight;
let sparkCtx = sparkCanvas.getContext('2d');

class Spark {
    constructor() {
        this.color = config.color[0];
        this.opacity = getRand(config.opacity);

        this.size = getRand(config.size);
        this.x = getRand([0, sparkCanvas.width]);
        this.y = sparkCanvas.height+this.size/2;

        this.vVertical = getRand(config.initVelocityVertical);
        this.vHorizontal = this.vVertical * getRand(config.initVelocityRatio);
        const acceleration = getRand(config.acceleration);
        this.aVertical = acceleration * this.vVertical / (this.vVertical + this.vHorizontal)
        this.aHorizontal = acceleration * this.vHorizontal / (this.vVertical + this.vHorizontal)

        this.maxLife = getRand(config.lifeTime);
        this.lifeTime = 0;
        this.destroyed = false;

        // Draw a spark, called each time when animation frame refreshes
        this.draw = () => {
            this.color = getColor(Math.max(this.lifeTime/this.maxLife, (sparkCanvas.height - this.y)/(sparkCanvas.height*0.5)));
            if (this.color >= config.color[1]) {
                this.destroyed = true;
                return;
            }

            sparkCtx.beginPath();
            sparkCtx.rect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);
            sparkCtx.strokeStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${this.opacity})`;
            sparkCtx.stroke();
            sparkCtx.fillStyle = `rgba(${this.color}, ${this.color}, ${this.color}, ${this.opacity})`;
            sparkCtx.fill();
            this.lifeTime++;
        }

        // Update the position of spark each time when animation frame refreshes
        this.update = () => {
            if (this.x + this.size/2 <= 0 || this.x + this.size/2 >= sparkCanvas.width) {
                this.vHorizontal = -this.vHorizontal;
            }
            // Update position
            this.x += this.vHorizontal;
            this.y += this.vVertical;

            // Update velocity
            this.vHorizontal += this.aHorizontal;
            this.vVertical += this.aVertical;
            
            this.draw();
        };
    }
}

// Create sparks
let sparks = [];
for (let i = 0; i < config.numSparks; i++) {
    sparks.push(new Spark());
}

window.addEventListener('resize', () => {
    sparkCanvas.width = window.innerWidth;
    sparkCanvas.height = window.innerHeight;
    config.numSparks = window.innerWidth >= 1000 ? 50 : Math.ceil(window.innerWidth/20)
    config.size = window.innerWidth >= 600 ? [10, 40] : [10*window.innerWidth/600, 40*window.innerWidth/600]
});

function animateSparks() {
    requestAnimationFrame(animateSparks);
    sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    for (let i = 0; i < sparks.length; i++) {
        sparks[i].update();
    }
    sparks = sparks.filter((spark)=>!spark.destroyed);

    let numSpare = config.numSparks - sparks.length;
    if (numSpare > 0 && Math.random() <= 0.02 * sparks.length) {
        sparks.push(new Spark());
    }
}

animateSparks();