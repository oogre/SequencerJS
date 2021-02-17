/*----------------------------------------*\
  beakerProject - sketch.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-04 22:38:59
  @Last Modified time: 2021-02-17 12:45:45
\*----------------------------------------*/
let audioPath = "./../assets/audio/West Rules/Pulso & Romain Richard/End Of Utopia EP/05.Eternal Life.mp3";
let sequencer;

let pm;
let pg;

function setup() {
	pg = createGraphics();
	colorMode(RGB);
	//noCursor();
	p5.Vector.x = new p5.Vector(1, 0, 0);
	p5.Vector.y = new p5.Vector(0, 1, 0);
	p5.Vector.z = new p5.Vector(0, 0, 1);
	p5.Vector.zero = ()=>new p5.Vector(0, 0, 0);
	p5.Vector.one = ()=>new p5.Vector(1, 1, 1);
	p5.Vector.random = ()=> {
		let t = floor(random(3));
		if(t == 0)return p5.Vector.x.copy();
		if(t == 1)return p5.Vector.y.copy();
		if(t == 2)return p5.Vector.z.copy();
	}

	frameRate(60);
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);
	sequencer = new Sequencer(audioPath, 132);
	const KickRecords = sequencer.registerSequence({
		name : "intro-kick",
		start : 1,
		onStart:(event)=>{},
		stop : 320,
		onStop:(event)=>sequencer.unregisterSequence(KickRecords) ,
		measure : 1,
		steps : [1],
		onStep:(event)=>{
			let t = pm.create();
			t.outColor = color(255);
			t.inColor = color(0);
		}
	});

	const zoomRecords = sequencer.registerSequence({
		name : "intro-zoom",
		start : 1,
		onStart:(event)=>{},
		stop : 128,
		onStop:(event)=>{
			setCamera(pm.cameraCrust);
			sequencer.unregisterSequence(zoomRecords);
		},
		measure : 1,
		steps : [1],
		onStep:(event)=>{
			pm.cameraFrontZoom = PI * lerp(0.8, 0.05, sqrt(event.amount));
		}
	});

	const crustRecords = sequencer.registerSequence({
		name : "crust-position",
		start : 128,
		onStart:(event)=>{},
		stop : 320,
		onStop:(event)=>{
			setCamera(pm.cameraCore);
			sequencer.unregisterSequence(crustRecords);
		},
		measure : 4,
		steps : [2, 4],
		onStep:(event)=>{
			let location = p5.Vector.random3D().mult(127)
			pm.cameraCrust.setPosition(location.x, location.y, location.z);
			pm.cameraCrust.lookAt(0, 0, 0);
		}
	});

	const rotateRecords = sequencer.registerSequence({
		name : "rotate",
		start : 65,
		stop : 128,
		onStop:(event)=>sequencer.unregisterSequence(rotateRecords) ,
		measure : 4,
		steps : [1, 3],
		onStep:(event)=>{
			pm.neigbourhoud(pm.random(), 10).map(particle=>{
				particle.orientation = particle.o.copy();
				particle.orientation.add(p5.Vector.random().mult(random(-PI, PI)*0.5));
				particle.moment = 0.1;
			});
		}
	});


	const rotateOrderRecords = sequencer.registerSequence({
		name : "rotate",
		start : 128,
		stop : 716,
		onStop:(event)=>sequencer.unregisterSequence(rotateOrderRecords) ,
		measure : 4,
		steps : [1, 3],
		onStep:(event)=>{
			let rotation = p5.Vector.random().mult(PI/2);
			pm.neigbourhoud(pm.random(), 20).map(particle=>{
				particle.orientation = rotation;
				particle.moment = 0.1;
			});
		}
	});

	const snaresRecords = sequencer.registerSequence({
		name : "snares",
		start : 130,
		stop : 328,
		onStop:(event)=>sequencer.unregisterSequence(snaresRecords) ,
		measure : 4,
		steps : [1+1/2, 2+1/2, 3+1/2, 4+1/2],
		onStep:(event)=>{
			let t = pm.random();
			t.dist = event.amount * 20;
			t.inColor = color(97, 1, 17);
			t.inColorSpeed = lerp(t.distSpeed*10, t.distSpeed * 0.1, event.amount);
		}
	});
	
	const Kick2Records = sequencer.registerSequence({
		name : "kick",
		start : 353,
		onStart:(event)=>{},
		stop : 590,
		onStop:(event)=>sequencer.unregisterSequence(Kick2Records) ,
		measure : 1,
		steps : [1],
		onStep:(event)=>{
			let t = pm.create();
			t.outColor = color(255);
			t.inColor = color(0);
		}
	});

	const crashRecords = sequencer.registerSequence({
		name : "kick",
		start : 388,
		onStart:(event)=>{},
		stop : 590,
		onStop:(event)=>sequencer.unregisterSequence(crashRecords) ,
		measure : 1,
		steps : [1+1/2],
		onStep:(event)=>{
			for(let i = 0 ; i < 10 ; i ++) {
				let t = pm.random();
				t.inColor = color(97, 1, 17);
				t.inColorSpeed = random() * 0.1;
			}
		}
	});

	pm = new ParticleManager();
}

function draw(){
	noStroke();
	sequencer.update();
	clear();
	pm.draw();
	ambientMaterial(255);
	sphere(900);

}

function windowResized(){
	resizeCanvas(window.innerWidth, window.innerHeight);
	pm.cameras.map(camera=>{
		camera.perspective(camera.cameraFOV, width/height);
	});
}
