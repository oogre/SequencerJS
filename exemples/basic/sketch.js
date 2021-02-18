/*----------------------------------------*\
  beakerProject - sketch.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-04 22:38:59
  @Last Modified time: 2021-02-18 08:16:16
\*----------------------------------------*/

let audioPath = "./../assets/audio/West Rules/Pulso & Romain Richard/End Of Utopia EP/05.Eternal Life.mp3";
let sequencer;

function setup() {
	noCursor();
	
	colorMode(RGB);
	
	frameRate(60);
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);

	sequencer = new Sequencer(audioPath, 132);
	sequencer.registerSequence({
		name : "intro-kick",
		stop : 320,
		measure : 4,
		onSteps : {
			[1, 3] : () => console.log("boom.."),
			[2, 4] : () => console.log(".tchac"),
		}
		onStep : () => {
			let t = pm.create();
			t.outColor = color(255);
			t.inColor = color(0);
		}
	});
	noStroke();
}

function draw(){
	sequencer.update();
}

function windowResized(){
	resizeCanvas(window.innerWidth, window.innerHeight);
}
