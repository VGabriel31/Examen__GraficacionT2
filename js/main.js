const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = 600;
const window_width = 950;

canvas.height = window_height;
canvas.width = window_width;

// Establece la imagen de fondo del canvas
const backgroundImage = new Image();
backgroundImage.src = "assets/img/fondo1.jpeg";



let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
let isMouseClicked = false;
let circleCount = 10;
let dynamicCircleCount = 0;
let lives = 3;
let score = 0;

class Circle {
    constructor(x, y, radius, image, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.image = new Image();
        this.image.src = image; // URL de la imagen
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.beginPath();
        // Dibujar la imagen como fondo del círculo
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
        context.closePath();
    }

    update(context) {
        this.draw(context);
        if (this.posX + this.radius >= window_width) {
            this.posX = window_width - this.radius;
            this.dx = -this.dx;
        } else if (this.posX - this.radius <= 0) {
            this.posX = this.radius;
            this.dx = -this.dx;
        }
        if (this.posY + this.radius >= window_height) {
            this.posY = window_height - this.radius;
            this.dy = -this.dy;
        } else if (this.posY - this.radius <= 0) {
            this.posY = this.radius;
            this.dy = -this.dy;
        }
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

function getDistance(posX1, posY1, posX2, posY2) {
    return Math.sqrt(Math.pow((posX2 - posX1), 2) + Math.pow((posY2 - posY1), 2));
}

function generateRandomCircles(numCircles) {
    let circles = [];
    for (let i = 0; i < numCircles; i++) {
        let radius = Math.random() * 20 + 20;
        let x = Math.random() * window_width;
        let y = Math.random() * window_height;
        let image = "assets/img/chuchu.png"; // URL de la imagen
        let speed = Math.random() * 4 + 2;
        circles.push(new Circle(x, y, radius, image, speed));
    }
    return circles;
}

let circles = generateRandomCircles(circleCount);

function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);
    // Dibujar la imagen de fondo
    ctx.drawImage(backgroundImage, 0, 0, window_width, window_height);
    circles.forEach(circle => circle.update(ctx));
    checkCollisions();
}

function generateAdditionalCircles() {
    const additionalCircles = generateRandomCircles(3);
    circles = circles.concat(additionalCircles);
    dynamicCircleCount += 3;
    updateCircleCount();

    if (circleCount + dynamicCircleCount > 10) {
        lives--;
        updateLivesCount();
    }
}

let circleGenerationInterval;
function stopCircleGeneration() {
    clearInterval(circleGenerationInterval);
}

function startCircleGeneration() {
    circleGenerationInterval = setInterval(generateAdditionalCircles, 5000);
}
startCircleGeneration();

function checkCollisions() {
    for (let i = 0; i < circles.length; i++) {
        circles[i].color = "blue";

        for (let j = 0; j < circles.length; j++) {
            if (i !== j) {
                if (getDistance(circles[i].posX, circles[i].posY, circles[j].posX, circles[j].posY) < (circles[i].radius + circles[j].radius)) {
                    circles[i].color = "red";
                    circles[j].color = "red";

                    const dx = circles[i].posX - circles[j].posX;
                    const dy = circles[i].posY - circles[j].posY;
                    const angle = Math.atan2(dy, dx);

                    circles[i].dx = Math.cos(angle) * circles[i].speed;
                    circles[i].dy = Math.sin(angle) * circles[i].speed;

                    circles[j].dx = -Math.cos(angle) * circles[j].speed;
                    circles[j].dy = -Math.sin(angle) * circles[j].speed;
                }
            }
        }
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

canvas.addEventListener('mousemove', function(evt) {
    getMousePos(canvas, evt);
});

canvas.addEventListener('mousedown', function(evt) {
    clickX = evt.clientX - canvas.getBoundingClientRect().left;
    clickY = evt.clientY - canvas.getBoundingClientRect().top;
    console.log("Coordenadas del clic: X:", clickX, "Y:", clickY);
    checkCircleClick();
});

function checkCircleClick() {
    circles.forEach((circle, index) => {
        const distance = getDistance(clickX, clickY, circle.posX, circle.posY);
        if (distance < circle.radius) {
            circle.color = "purple";
            ctx.fillStyle = "purple";
            ctx.beginPath();
            ctx.arc(circle.posX, circle.posY, circle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            console.log("Se hizo clic dentro del círculo");
            circles.splice(index, 1);
            dynamicCircleCount--;
            updateCircleCount();
            score++;
            updateScore();
        }
    });
}

function updateCircleCount() {
    document.getElementById("circle-count").innerText = "chuchus Atacando: " + (circleCount + dynamicCircleCount);
}

function updateLivesCount() {
    document.getElementById("lives-count").innerText = "Vidas restantes: " + lives;
    if (lives === 0) {
        stopCircleGeneration();
        alert("¡Juego terminado! Tu puntaje final es: " + score);
        startNewGame();
    }
}

function updateScore() {
    let highScore = localStorage.getItem("highScore");

    if (!highScore || score > parseInt(highScore)) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    document.getElementById("score").innerText = "Puntaje: " + score;
    document.getElementById("high-score").innerText = "Puntaje máximo: " + highScore;
}

updateCircles();

function drawMouseCoordinates() {
    ctx.save();
    updateMouseCoordinates(ctx);
    ctx.restore();
    requestAnimationFrame(drawMouseCoordinates);
}

drawMouseCoordinates();

function startNewGame() {
    lives = 3;
    score = 0;
    dynamicCircleCount = 0;
    circles = generateRandomCircles(circleCount);
    updateLivesCount();
    updateCircleCount();
    updateScore();
    startCircleGeneration();
    location.reload();
}
