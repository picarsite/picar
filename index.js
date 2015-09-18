// Version: 1.0.0

// The MIT License (MIT)

// Copyright (c) 2015 Adrian Przybyla and Michael Piela

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Website: https://picarsite.wordpress.com

// Load the http module to create an http server.
var http = require('http'); 
// Needed to set the gpio pins
var gpio = require("pi-gpio");
var url = require("url");
var fs = require("fs");
var piblaster = require('pi-blaster.js');

var driveMiddle = 0.162;
var maxLeft = -5;
var maxRight = 5;



// Sets drive direction to middle
piblaster.setPwm(0, driveMiddle);

// Create a function to handle every HTTP request
function handler(req, res){
	
		
	var form = '';
	var pathname = url.parse(req.url).pathname;
	console.log("Request for " + pathname + " received.");

	if(req.method == "GET"){ 

    form = '<!doctype html> \
<html lang="en"> \
<head> \
    <meta charset="UTF-8">  \
    <title>PiCar</title> \
</head> \
<body> \
	<ul> \
		<li>X-Achse: <span id="accelerationX"></span></li> \
		<li>Y-Achse: <span id="accelerationY"></span></li> \
		<li>Z-Achse: <span id="accelerationZ"></span></li> \
		<li>XYZ-Achse (Formatiert): <span id="formatedData"></span></li> \
		<li>XYZ-Achse (Respond/Reaktion/Bekommen): <span id="gotFormatedData"></span></li> \
	</ul> \
	<script language="javascript" type="text/javascript" src="javascript.js"></script> \
</body> \
</html>';

  //respond
	res.setHeader('Content-Type', 'text/html');
	res.writeHead(200);
	if(pathname == "/") {
        res.end(form);
    } else if (pathname == "/javascript.js") {
        script = fs.readFileSync("/home/picar/javascript.js", "utf8");
        res.write(script);
		res.end();
    }
  
  
  }else if(req.method == 'POST'){

		//read given data
		req.on('data', function(chunk)
		{
			//grab form data as string
			var formatedData = chunk.toString();
			//grab x, y and z data
			var x = eval(formatedData.split("&")[0]);
			var y = eval(formatedData.split("&")[1]);
			var z = eval(formatedData.split("&")[2]);
			var axisChanged1 = formatedData.split("&")[3];
			var axisChanged2 = formatedData.split("&")[4];
			 
				
			console.log("X: " + x + " Y: " + y + " Z:" + z + "\nAxischanged="+axisChanged1+" "+axisChanged2);
			console.log("raw data: \"" + formatedData + "\"");

			lastStatus = "stop";

			//drive forwards
			if(axisChanged1 == "z")
			{
				if(z > 7)
				{
					driveForward();
					console.log("forward");
				}
				else if(z < 3) // drive backwards
				{
					driveBackward();
					console.log("backward");
				}
				else // stop
				{
					driveStop();
					console.log("stop");
				}
				
				if(axisChanged2 == "y")
				{
					driveServo(y);
				}
			}
			else if(axisChanged1 == "y")
			{
				driveServo(y);
			}

			//fill the given data to gotFormatedData
			gotFormatedData = formatedData;

			//respond
			res.setHeader('Content-Type', 'text/html');
			res.writeHead(200);
			res.end(gotFormatedData);

		});

	} 
	else {
		res.writeHead(200);
		res.end("no data");
	};

};

// Sets the GPIO pins so that the car drives forward
function driveForward() {
	gpio.open(16, "output", function(err) {     // Open pin 16 for output 
		gpio.write(16, 0, function() {          // Set pin 16 high (1) 
			gpio.close(16);                     // Close pin 16 
		});
	});
	gpio.open(18, "output", function(err) {     // Open pin 18 for output 
		gpio.write(18, 1, function() {          // Set pin 18 low (0) 
			gpio.close(18);                     // Close pin 18 
		});
	});
	gpio.open(22, "output", function(err) {     // Open pin 22 for output 
		gpio.write(22, 1, function() {          // Set pin 22 high (1) 
			gpio.close(22);                     // Close pin 22 
		});
	});
}

// Sets the GPIO pins so that the car drives backward
function driveBackward() {
	gpio.open(16, "output", function(err) {     // Open pin 16 for output 
		gpio.write(16, 1, function() {          // Set pin 16 low (0) 
			gpio.close(16);                     // Close pin 16 
		});
	});
	gpio.open(18, "output", function(err) {     // Open pin 18 for output 
		gpio.write(18, 0, function() {          // Set pin 18 high (1) 
			gpio.close(18);                     // Close pin 18 
		});
	});
	gpio.open(22, "output", function(err) {     // Open pin 22 for output 
		gpio.write(22, 1, function() {          // Set pin 22 high (1) 
			gpio.close(22);                     // Close pin 22 
		});
	});
}

// Sets the GPIO pins so that the car stops
function driveStop() {
	gpio.open(22, "output", function(err) {     // Open pin 22 for output 
		gpio.write(22, 0, function() {          // Set pin 22 low (0) 
			gpio.close(22);                     // Close pin 22 
		});
	});
}

function driveServo(y)
{
	if(y < maxRight && y > maxLeft)
	{
		var servoResult = driveMiddle + 0.003 * y;
		piblaster.setPwm(18, servoResult);
	}
}

// Create a server that invokes the `handler` function upon receiving a request
http.createServer(handler).listen(8000, function(err){
  if(err){
    console.log('Error starting http server');
  } else {
    console.log("Server running at http://127.0.0.1:8000/ or http://localhost:8000/");
  };
});