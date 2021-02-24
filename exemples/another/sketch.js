/*----------------------------------------*\
  beakerProject - sketch.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-04 22:38:59
  @Last Modified time: 2021-02-22 18:23:38
\*----------------------------------------*/


 let cameraFront;

function windowResized(){
	resizeCanvas(window.innerWidth, window.innerHeight);
}


function setup() {
	//noCursor();	
	frameRate(60);
	colorMode(RGB);
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);	
	noiseSeed(1);

	cameraFront = createCamera();
	cameraFront.setPosition(0, 0, 800);
	cameraFront.lookAt(0, 0, 0);
	cameraFront.default_zoom = PI * 0.8;
	cameraFront._zoom = cameraFront.default_zoom;
	setCamera(cameraFront);
}

function draw(){
	background(255);
	cameraFront.setPosition(0, 0, mouseX);

//	rotateY(mouseX/width * TWO_PI);
	rotateZ(mouseY/height * PI);
	//translate(-width/2, -height/2);
	//translate(mouseX, mouseY);
	fill(255);
	noStroke();
	
	noFill();
	stroke(0);
	customLine({
		x1 : -1 * width>>1, 
		y1 : 0,  
		z1 : 0, 
		x2 : width>>1, 
		y2 : 0,  
		z2 : 0, 
		maxDist : 5,
		displace : (point, progress, current) => {
			let damp = 1-abs(lerp(-1, 1, progress));
			let offset = -1 * frameCount * 0.005 - current*0.07;
			let out = p5.Vector.add(point, new p5.Vector(
				0, damp * lerp(-1, 1, noise(0.1, 1, offset)) * 100,0
				//damp * lerp(-1, 1, noise(0.1, 1, offset)) * 100,
				//damp * lerp(-1, 1, noise(0.1, 2, offset)) * 100,
				//damp * lerp(-1, 1, noise(0.1, 3, offset)) * 100
			));
			return out;
		}
	});

}

function polygone(x, y, summit, width, height){
	if(height == undefined || height == null) height = width;
	let angleInc = TWO_PI / summit;
	let angle = -PI/2 ;
	beginShape();
	for(let i = 0 ; i < summit ; i ++){
		let _x = x + width * cos(angle);
		let _y = y + height * sin(angle);
		vertex(_x, _y)
		angle += angleInc;
	}
	endShape(CLOSE);
}

function customLine({x1=0, y1=0, z1=0, x2=0, y2=0, z2=0, maxDist=20, displace=(point, progress, current)=>{return new p5.Vector(0, 0);}}){
	let po = new p5.Vector(x1, y1, z1);
	let pd = new p5.Vector(x2, y2, z2);
	let pt = p5.Vector.sub(pd, po);
	let dist = pt.mag();
	let stepCount = ceil(dist / maxDist);
	let step = pt.div(stepCount);
	let r = 1/stepCount;
	let sr = 0;
	beginShape();
	let p = po.copy();
	for(let s = 0 ; s <= stepCount ; s ++){
		let point = displace(p, sr, s);
		vertex(point.x, point.y, point.z);
		p.add(step);
		sr += r;
	}
	endShape();
}