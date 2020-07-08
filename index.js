const { Engine, Render, World, Body, Bodies, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsVertical = 15;
const cellsHorizontal = 20;


const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;


const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});


Engine.run(engine);
Render.run(render);


//Walls
const leftWall = Bodies.rectangle(0, height/2, 10, height, { isStatic : true });
const rightWall = Bodies.rectangle(width, height/2, 10, height, { isStatic : true });
const bottomWall = Bodies.rectangle(width / 2 , height, width, 10, { isStatic : true });
const topWall = Bodies.rectangle(width/2, 0, width, 10, { isStatic : true });

World.add(world, [leftWall, bottomWall, rightWall, topWall])


//Maze Generation 

const shuffle= (arr)=>{
    let counter = arr.length;
    while (counter >0) {
        const index = Math.floor(Math.random() * counter)

        counter --;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal-1).fill(false));
const horizontals = Array(cellsVertical-1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) =>{
    // if cell already visitde at [row, column] reurn
    if(grid[row][column]){
        return;
    }
    //Mark this cells  as being visited
    grid[row][column] = true;
    //Assemble randomly-order list of neghbours
    const neighbours = shuffle([
        [row -1, column, "up"],
        [row, column +1, "right"],
        [row +1, column, "down"],
        [row, column -1, "left"]
    ]);
    //For each neighbour...
    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;
    //See if neighbour is out of bounds
        if(nextColumn < 0 || nextColumn >= cellsHorizontal || nextRow < 0 || nextRow >= cellsVertical){
            continue;
        }
    //if we have visited that neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn]){
            continue;
        }
    //remove wall from either horizontals or verticals
         if(direction === "left"){
             verticals[row][column -1] = true;
         } else if (direction ==="right"){
            verticals[row][column] = true;
         }
         if(direction === "up"){
             horizontals[row -1][column] = true;
         } else if(direction === "down"){
             horizontals[row][column] = true;
         }
         stepThroughCell(nextRow, nextColumn)
    }  
};


stepThroughCell(startRow, startColumn);

//iterate through arrays and build the walls

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open === true){
            return
        } 
            
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {   
                label: "wall",
                isStatic: true,
                render: {
                    fillStyle: "wheat"
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open === true){
            return
        } 
            
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {   
                label: "wall",
                isStatic: true,
                render: {
                    fillStyle: "wheat"
                }
            }
        );
        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2 ,
    height - unitLengthY / 2,
    unitLengthX * .6,
    unitLengthY * .6,
    {
        label : "goal",
        isStatic: true,
        render: {
            fillStyle: "green"
        }
    })
World.add(world, goal);


// Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) * .3;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label : "ball",      
        render : {
            fillStyle: "wheat",
        }
    });

World.add(world, ball);

const moveBall = () => {
    document.addEventListener("keydown", (event) => {
        const {x , y} = ball.velocity;
        if(event.keyCode == 38) {
            Body.setVelocity(ball, {x , y: y - 5})
        }
        if(event.keyCode == 39) {
            Body.setVelocity(ball, {x: x + 5  , y})
        }
        if(event.keyCode == 40) {
            Body.setVelocity(ball, {x , y: y + 5})
        }
        if(event.keyCode == 37) {
            Body.setVelocity(ball, {x: x - 5  , y})
        }
    });
};

const start= () =>{
    document.addEventListener("keydown", event =>{
        if(event.keyCode == 32){
            document.querySelector(".start").classList.add("hidden")
            moveBall();
        }  
    });
};

start();

Events.on(engine, "collisionStart", event => {
    event.pairs.forEach((collision) => {
        const labels = ["goal", "ball"];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            const message = document.querySelector(".winner")
            message.classList.remove("hidden"); 
            world.gravity.y = 1;
            world.bodies.forEach((el) =>{
                if(el.label === "wall"){
                    Body.setStatic(el, false);
                }
            });
        };
    });
});