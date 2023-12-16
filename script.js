import g from "./graphics.js";

const rows = 20;
const cols = 20;
const grid = new Array(rows * cols).fill(0);

let len;
let head;
let dir;
let last_dir;
let food;
let available;
let frame;
let paused;
let started;
let dead;
let countdown;
let abort;
let score;
let highscore = 0;
let played;
let win;
grid[0] = 4;

g.init();

window.addEventListener("resize", () => {
    redraw();
    redraw_menu();
});

function redraw() {
    g.resize_svg();
    g.clear();

    const lines = g.square({x: 0, y: 0}, 1.02);
    lines.setAttribute("fill", "#111111");
    lines.setAttribute("rx", "3px");
    g.add(lines);

    for(let i = 0; i < rows * cols; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cell = g.square({x: col / cols - 0.475, y: row / rows - 0.475}, 0.04);
        if(i === food) {
            cell.setAttribute("fill", "#dbac00");
        } 
        else if(grid[i] > 0) {
            cell.setAttribute("fill", "#cc0242");
        }
        else cell.setAttribute("fill", "#171717");
        cell.setAttribute("rx", "2px");
        g.add(cell);
    }

    const score_text = g.text({x: 1, y: 0.4}, `SCORE: ${score}`, 0.1);
    const highscore_text = g.text({x: 1, y: 0.2}, `HIGHSCORE: ${highscore}`, 0.1);
    score_text.setAttribute("fill", "#ffffff");
    score_text.setAttribute("font-weight", "bold");
    highscore_text.setAttribute("fill", "#ffffff");
    highscore_text.setAttribute("font-weight", "bold");
    g.add(score_text);
    g.add(highscore_text);
}

function redraw_menu() {
    g.clear(1);

    const message = g.text({x: 0, y: 0}, win ? "YOU WIN" : dead ? "GAME OVER" : "PAUSED", 0.3);
    message.setAttribute("fill", "#ffffff");
    message.setAttribute("font-weight", "bold");
    g.add(message, 1);

    const button = g.rect({x: -0.2, y: -0.1}, {x: 0.2, y: -0.3});
    const reset_text = g.text({x: 0, y: -0.25}, "RESET", 0.15);
    const handle_click = (e) => {
        e.stopPropagation();
        g.clear(1);
        reset();
        abort = true;
        redraw();
    };
    button.setAttribute("fill", "#ffffff");
    button.setAttribute("rx", "3px");
    button.addEventListener("mouseup", handle_click);
    reset_text.setAttribute("fill", "#000000");
    reset_text.setAttribute("font-weight", "bold");
    reset_text.addEventListener("mouseup", handle_click);
    g.add(button, 1);
    g.add(reset_text, 1);
}

window.addEventListener("keydown", (e) => {
    if(dead) return;

    if(e.key === "p") {
        paused = !paused;
        if(paused) redraw_menu();
        else {
            g.clear(1);
            main_loop();
        }
        return;
    }

    if(paused) return;
    switch(e.key) {
        case "ArrowUp": case "w":
            if(last_dir !== "down") dir = "up";
            break;
        case "ArrowDown": case "s":
            if(last_dir !== "up") dir = "down";
            break;
        case "ArrowLeft": case "a":
            if(last_dir !== "right") dir = "left";
            break;
        case "ArrowRight": case "d":
            if(last_dir !== "left") dir = "right";
            break;
        default:
            return;
    }
    if(!started) {
        started = true;
        abort = false;
        main_loop();
    }
});

function reset() {
    len = 4;
    head = 0;
    dir = "right";
    last_dir = "right";
    food = 3;
    available = [];
    frame = 0;
    paused = false;
    started = false;
    dead = false;
    abort = false;
    countdown = 1;
    score = 0;
    played = false;
    grid.fill(0);
    grid[0] = 4;
}

function danger() {
    return (head % cols === 0 && dir === "left") ||
        (head % cols === cols - 1 && dir === "right") ||
        (head / rows < 1 && dir === "down") ||
        (head / rows >= rows - 1 && dir === "up") ||
        (grid[head + cols] > 0 && dir === "up") ||
        (grid[head - cols] > 0 && dir === "down") ||
        (grid[head + 1] > 0 && dir === "right") ||
        (grid[head - 1] > 0 && dir === "left");
}

function tick() {
    if(score === rows * cols - 4) {
        win = true;
        redraw_menu();
        return;
    }
    if(danger()) {
        dead = true;
        countdown = len;
        if(!played) {
            const sfx = new Audio("sfx.mp3");
            sfx.play();
            played = true;
        }
        redraw_menu();
    }
    available = [];
    switch(dir) {
        case "up":
            head += cols;
            break;
        case "down":
            head -= cols;
            break;
        case "left":
            head--;
            break;
        case "right":
            head++;
            break;
    }
    for(let i = 0; i < rows * cols; i++) {
        if(grid[i] > 0 && head !== food) grid[i]--;
        if(grid[i] === 0 && i !== head) available.push(i);  
    }
    if(dead) {
        redraw();
        return;
    }
    if(head === food) {
        len++;
        score++;
        if(score > highscore) highscore = score;
        food = available[Math.floor(Math.random() * available.length)];
    }
    grid[head] = len;
    last_dir = dir;
    redraw();
    console.log(food)
}

function main_loop() {
    if(abort) return;
    if(!paused && countdown > 0) requestAnimationFrame(main_loop);
    if(frame > 10) {
        frame -= 10;
        tick();
        if(dead) countdown--;
    } else frame++;
}

reset();
redraw();