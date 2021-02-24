/*----------------------------------------*\
  beakerProject - sketch.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-04 22:38:59
  @Last Modified time: 2021-02-22 12:07:11
\*----------------------------------------*/

let audioPath = "./../assets/audio/Music/Candies in a Jar(Solar Skeleton).mp3";
let sequencer;
let elements = [];

function setup() {
	noCursor();	
	frameRate(60);
	colorMode(RGB);
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);

	sequencer = new Sequencer(audioPath, 33);
	sequencer.registerSequence({
		name : "snare",
		stop : 65,
		onStop : ()=>{
			elements.filter(e=>random(2)<1).map((e, id, list)=>{
				e.id = list[0].id;
				e.speed = 0.5;
				e.dir = list[0].dir 
				e.randomMove = p5.Vector.mult(e.dir, e.speed);
				e.target.mult(random(1, 2));
			});
		},
		steps : [1+1/4, 1+1/2],
		onStep : (event)=>{
			elements.push(new Glider());
		}
	});
}

function draw(){
	sequencer.update();
	background(255);
	fill(0);
	noStroke();
	ellipse(0, 0, 2);
	elements.map(element=>element.draw());
}

function windowResized(){
	resizeCanvas(window.innerWidth, window.innerHeight);
}

class Glider{
	constructor(){
		this.id = Glider.ID++;
		this.head = new p5.Vector(0, 0);
		this.body = [];
		this.dir = p5.Vector.random2D();
		this.speed = lerp(0.5, 0.1, noise(this.id));
		this.randomMove = p5.Vector.mult(this.dir, this.speed);
		this.target = p5.Vector.random2D().mult(100);
	}
	draw(){
		push();
		noFill(0);
		stroke(0);
		strokeWeight(2);
		beginShape();
		vertex(this.head.x, this.head.y);
		this.body.map(({x, y})=>vertex(x, y));
		endShape();
		pop();

		let targetMove = p5.Vector.sub(this.target, this.head).mult(0.003);
		let noiseValue = noise(this.id, frameCount*0.1);
		let rotation = lerp(-1* this.speed, this.speed, noiseValue);
		this.randomMove.rotate(rotation);
		let move = p5.Vector.add(this.randomMove, targetMove);
		
		this.body.push(this.head.copy());
		this.head.add(move);
		
		if(this.body.length > 20){
			this.body.shift();
		}
	}	
}
Glider.ID = 0;