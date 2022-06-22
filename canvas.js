const particleColor = 175;
const numParticles = 25;
let nextID = 0;

// Resize canvas
let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})
let c = canvas.getContext('2d');

// Define particle behaviors
class Particle {
    constructor(x, y, dx, dy, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.r = 1;
        this.dx = dx;
        this.dy = dy;
        this.color = particleColor;
        this.mouseRepelBuffer = 0;

        this.connected = new Set();

        this.draw = () => {
            c.beginPath();
            c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
            c.strokeStyle = `rgb(${this.color}, ${this.color}, ${this.color})`;
            c.stroke();
            c.fillStyle = `rgb(${this.color}, ${this.color}, ${this.color})`;
            c.fill();
        };

        this.update = () => {
            if (this.x + this.r > window.innerWidth || this.x - this.r < 0) {
                this.dx = -this.dx;
            }
            if (this.y + this.r > window.innerHeight || this.y - this.r < 0) {
                this.dy = -this.dy;
            }
            this.x += this.dx;
            this.y += this.dy;
            this.draw();
        };
    }
}

const drawLine = (x1, y1, x2, y2, color) => {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.strokeStyle = color;
    c.stroke();
}

// Create circles
let particles = {};
for (var i = 0; i < numParticles; i++) {
    particles[nextID] = new Particle(
        Math.random() * (window.innerWidth - 2) + 1,
        Math.random() * (window.innerHeight - 2) + 1,
        Math.random() - 0.5,
        Math.random() - 0.5,
        nextID
    );
    nextID++;
}

// Track mouse movement
let mouse = {
    x: undefined,
    y: undefined,
    focused: true
}
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});
window.addEventListener('mouseout', () => {
    mouse.focused = false;
});
window.addEventListener('mouseover', () => {
    mouse.focused = true;
});

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    // Draw particles and remove particles that had been disconnected for a while
    for (let key in particles) {
        particles[key].update();
        if (particles[key].color == 255) {
            delete particles[key];
        } else if (particles[key].color > particleColor) {
            particles[key].color += 0.5;
        }
    }

    // Connect particles by line if close enough
    const keys = Object.keys(particles);
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            let p1 = particles[keys[i]];
            let p2 = particles[keys[j]];

            // Brightness of line segment is proportional to the distance between particles
            let dist = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
            if (dist <= 22500) {
                color = dist / 22500 * (255 - particleColor) + particleColor;
                drawLine(p1.x, p1.y, p2.x, p2.y, `rgb(${color}, ${color}, ${color})`);
                p1.connected.add(p2.id);
                p2.connected.add(p1.id);
                p1.color = particleColor;
                p2.color = particleColor;
            } else {
                // Particles gradually disappear after line segment breaks 
                // and no further connections are made
                if (p1.connected.has(p2.id)) {
                    p1.connected.delete(p2.id);
                    p2.connected.delete(p1.id);
                    if (p1.connected.size == 0) {
                        p1.color += 0.5;
                    }
                    if (p2.connected.size == 0) {
                        p2.color += 0.5;
                    }
                }
            }

            // Particles are attracted by each other by simulated gravity
            let dx = 50 / numParticles * (p1.x - p2.x) / Math.pow(dist + 5, 1.5);
            let dy = 50 / numParticles * (p1.y - p2.y) / Math.pow(dist + 5, 1.5);
            p1.dx -= dx;
            p1.dy -= dy;
            p2.dx += dx;
            p2.dy += dy;
        }
    }

    // Create new particles if not enough particles are present
    if (keys.length < numParticles) {
        if (Math.random() < 0.005 * (numParticles - keys.length)) {
            particles[nextID] = new Particle(
                Math.random() * (window.innerWidth - 2) + 1,
                Math.random() * (window.innerHeight - 2) + 1,
                Math.random() - 0.5,
                Math.random() - 0.5,
                nextID
            );
            nextID++;
        }
    }

    // Mouse interatction
    for (let key in particles) {
        if (!mouse.focused) {
            continue;
        }
        let particle = particles[key];
        let dist = Math.pow(particle.x - mouse.x, 2) + Math.pow(particle.y - mouse.y, 2);
        if (dist <= 10000) {
            let dx = (particle.x - mouse.x) / (dist + 5);
            let dy = (particle.y - mouse.y) / (dist + 5);
            particle.dx += dx;
            particle.dy += dy;
            particle.mouseRepelBuffer += 1;
        } else {
            if (particle.mouseRepelBuffer > 0) {
                particle.mouseRepelBuffer -= 1;
                particle.dx *= 0.99;
                particle.dy *= 0.99;
            }
        }
    }
}
animate();