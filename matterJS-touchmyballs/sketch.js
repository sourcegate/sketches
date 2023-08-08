// Function to generate random shades of blue
function getRandomBlue() {
  var blue = Math.floor(Math.random() * 256);
  var green = Math.floor(Math.random() * (blue / 2));
  var red = Math.floor(Math.random() * (blue / 4));
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
}

// Global variables
var Engine, Render, Runner, Composites, MouseConstraint, Mouse, Composite, Bodies;
var engine, world, render, runner;
var stack;

// Initialize the Matter.js engine and world
initializeMatter();

function initializeMatter() {
  Engine = Matter.Engine;
  Render = Matter.Render;
  Runner = Matter.Runner;
  Composites = Matter.Composites;
  MouseConstraint = Matter.MouseConstraint;
  Mouse = Matter.Mouse;
  Composite = Matter.Composite;
  Bodies = Matter.Bodies;

  // Create engine
  engine = Engine.create();
  world = engine.world;

  // Create renderer
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
      showAngleIndicator: false,
      wireframes: false
    }
  });

  Render.run(render);

  // Create runner
  runner = Runner.create();
  Runner.run(runner, engine);

  // Add bodies
  stack = Composites.stack(window.innerWidth * 0.1, window.innerHeight * 0.1, 6, 4, 20, 20, function(x, y) {
    return Bodies.circle(x, y, 60, { // Adjusted radius
      restitution: 1, // This makes the balls bounce
      render: {
        fillStyle: getRandomBlue()
      }
    });
  });

  Composite.add(world, [
    Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 50, { isStatic: true, render: { fillStyle: 'darkblue' } }),
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, { isStatic: true, render: { fillStyle: 'darkblue' } }),
    Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true, render: { fillStyle: 'darkblue' } }),
    Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true, render: { fillStyle: 'darkblue' } }),
    stack
  ]);

  // Add mouse control
  var mouse = Mouse.create(render.canvas);
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

  Composite.add(world, mouseConstraint);
  render.mouse = mouse;

  // Fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: window.innerWidth, y: window.innerHeight }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    window.location.reload(false);
  });
}
