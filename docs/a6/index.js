// Store baud rate to match Arduino sketch
const BAUD_RATE = 9600;

// Create variable to store serial object
let serial;

// Create variable for connect button
let portButton;

// Store joystick-controlled position
let xPos = 200;
let yPos = 200;

// Store latest button state from Arduino
let buttonState = 1;

// Store previous button state to detect press event
let lastButtonState = 1;

// Track LED state being sent to Arduino
let ledOn = false;

// Track which background color is active
let colorMode = 0;


// Runs once at program start
function setup() {

  // Create canvas that fills entire browser window
  createCanvas(windowWidth, windowHeight);

  // Initialize WebSerial
  serial = createSerial();

  // Create connect button
  portButton = createButton('Connect Arduino');

  // Position connect button near top-left corner
  portButton.position(20, 20);

  // Run connect function when button pressed
  portButton.mousePressed(connectPort);
}


// Runs continuously
function draw() {

  // Set background color based on colorMode value
  if (colorMode == 0) {
    background('red');
  } 
  else if (colorMode == 1) {
    background('blue');
  } 
  else {
    background('green');
  }

  // Check if serial data is available
  if (serial.available() > 0) {

    // Read one full line from serial buffer
    let data = serial.readUntil('\n');

    // Print raw data for debugging
    console.log(data);

    // If data exists
    if (data) {

      // Split CSV string into array
      let sensors = split(trim(data), ',');

      // Confirm we received x, y, and button
      if (sensors.length == 3) {

        // Map joystick X value (0–1023) to full window width
        xPos = map(int(sensors[0]), 0, 1023, width, 0);

        // Map joystick Y value (0–1023) to full window height
        yPos = map(int(sensors[1]), 0, 1023, height, 0);

        // Store button state (0 when pressed)
        buttonState = int(sensors[2]);

        // Detect button press transition (HIGH → LOW)
        if (lastButtonState == 1 && buttonState == 0) {

          // Cycle to next background color
          colorMode++;

          // Keep colorMode within 0–2 range
          if (colorMode > 2) {
            colorMode = 0;
          }
        }

        // Update last button state
        lastButtonState = buttonState;
      }
    }
  }

  // Draw black circle controlled by joystick
  fill(0);
  ellipse(xPos, yPos, 30, 30);
}



// Sends LED control to Arduino
function mousePressed() {

  // Toggle LED state
  ledOn = !ledOn;

  // If LED should turn on
  if (ledOn) {

    // Send character '1' to Arduino
    serial.write('1');

  } else {

    // Send character '0' to Arduino
    serial.write('0');
  }
}


// Connect to Arduino through WebSerial
function connectPort() {

  // If serial is not already open
  if (!serial.opened()) {

    // Open serial connection at matching baud rate
    serial.open(BAUD_RATE);

    // Hide connect button once connected
    portButton.hide();
  }
}