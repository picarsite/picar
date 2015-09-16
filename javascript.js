
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

var direction = "stop";
var smartphoneAlignChangedDone = false;

function cut(number)
{
	return Math.round(number);
}

function sendStatus(formatedData)
{
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST","",true);
	xmlhttp.setRequestHeader("Content-type","text/html");
	xmlhttp.send(formatedData);
}

function axisChanged(oldZ, z)
{
	
	//wenn beide vorwärts, dann z nicht geändert
	if(z > 7 && direction != "forward")
	{
		direction = "forward";
		return true;
	}

	if(z < 7 && z > 3 && direction != "stop")
	{
		direction = "stop";
		return true;
	}
	
	if(z < 3 && direction != "backward")
	{
		direction = "backward";
		return true;
	}
	
	return false;
}
 
var x = 0.0, y = 0.0, z = 0.0;
var oldZ = 0.0, oldY = 0.0;

if (window.DeviceMotionEvent != undefined) 
{  
	
	

	window.ondevicemotion = function(e) 
	{ 			 
		if(!(window.innerHeight > window.innerWidth))
		{
			smartphoneAlignChangedDone = false;
			var formatedData = ""; 
			
			x = cut(e.accelerationIncludingGravity.x); 
			y = cut(e.accelerationIncludingGravity.y); 
			z = cut(e.accelerationIncludingGravity.z); 
			formatedData = "X="+x+"&Y="+y+"&Z="+z;
			document.getElementById("accelerationX").innerHTML = x;
			document.getElementById("accelerationY").innerHTML = y;
			document.getElementById("accelerationZ").innerHTML = z; 
			document.getElementById("formatedData").innerHTML = formatedData;
			
			var doSendStatus = false;
			
			if(axisChanged(oldZ, z))
			{
				formatedData = formatedData+"&z";
				doSendStatus = true;
			}
			
			if(cut(y) != cut(oldY))
			{ 
				formatedData = formatedData+"&y"; 
				doSendStatus = true;
			}
			
			if(doSendStatus == true)
			{
				sendStatus(formatedData);
			}
			
			oldZ = z;
			oldY = y;
		}
		else
		{
			if(smartphoneAlignChangedDone==false)
			{
				formatedData = "X=0&Y=0&Z=5&z&y";
				sendStatus(formatedData);
				smartphoneAlignChangedDone = true;
			}
		}
	
		
		 
		// xmlhttp.onreadystatechange=function()
		// { 				
			// if(xmlhttp.readyState==4 && xmlhttp.status==200)
			// {
				// document.getElementById("gotFormatedData").innerHTML=xmlhttp.responseText; 
			// }
		// };
	} 					
}
// var test123 = "123";
// xmlhttp.open("POST","",true);
// xmlhttp.setRequestHeader("Content-type","text/html");
// xmlhttp.send(test123);