/*----------------------------------------*\
  21.2.camera - Sequencer.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-14 17:04:54
  @Last Modified time: 2021-02-17 14:31:04
\*----------------------------------------*/

/*
	const sequencer = new Sequencer("track.mp3", BPM)
	sequencer.loop(0, 28) // for looping between step 1 and step 28
	//sequencer.play()
	sequencer.sequence({
		name : "intro-kick",
		start : 1,
		onStart : ()=>{},
		stop : 12,
		onStop : ()=>{},
		measure : 4,
		steps : [1, 2, 3 + 2/3]
		onStep : ()=>{}
	});
	sequencer.update();
*/

import AudioPlayer from "./AudioPlayer.js";
import EventHelper from "./EventHelper.js";
import {divAndMod, isFunction} from "./Tools.js";

export default class Sequencer{
	constructor(audioPath, BPM, debug=true){
		this.player = new AudioPlayer(audioPath);
		this.eventHelper = new EventHelper();
		this.BPM = BPM;
		this.StepPerBeat = 24;
		this._tic = 0;
		this.currentStep = 0;
		this.sloop = new p5.SoundLoop(cycleStartTime => {
			this.currentStep = this.step;
			this.eventHelper.trigger(`step.${this.currentStep}`, {step : this.currentStep});
			this._tic ++;
		}, this.interval);

		this.eventDict = {};

		this.playBtn = document.createElement("button");
		this.playBtn.innerText = "play";
		this.playBtn.style.position="absolute";
        this.playBtn.style.top="50%";
        this.playBtn.style.left="50%";
        this.playBtn.style.transform="translate(-50%, -50%)";
		document.body.append(this.playBtn);
		document.querySelector("button").addEventListener("click", (event)=>{
			this.playBtn.parentElement.removeChild(this.playBtn);
			sequencer.play();	
		});	

		if(debug){
			this.debug = true;
			this.debugDiv = document.createElement("div");
			this.debugDiv.style.position = "absolute";
	        this.debugDiv.style.top = "75%";
	        this.debugDiv.style.left = "50%";
	        this.debugDiv.style.transform = "translate(-50%, -50%)";
	        this.debugDiv.style.color = "red";
	        this.debugDiv.style.fontSize = "50px";
			document.body.append(this.debugDiv);
		}
	}
	registerSequence({name, start=1, onStart, stop = 10, onStop, measure=1, steps = [1], onStep = ()=>{}}={}){
		start = start-1;
		let recorded = [];

		let _onStep = (event)=>{
			onStep({
				amount : (event.step - start) / (stop - start - 1),
				...event
			});
		}

		if(Number.isInteger(start) && start>= 0 && isFunction(onStart)){
			this.eventHelper.on(`step.${start}`, onStart);	
			recorded.push([`step.${start}`, onStart]);
		}

		let n = 0;
		for(let j = start ; j < stop ; j++){
			for(let i = 0 ; i < this._StepPerBeat ; i ++){
				let a = i/this._StepPerBeat;
				let r_step = 1 + (n % measure) + a;
				let step = start + n + a;
				if(steps.includes(r_step)){
  					this.eventHelper.on(`step.${step}`, _onStep);	
					recorded.push([`step.${step}`, _onStep]);
				}
			}	
			n++;
		}

		if(Number.isInteger(stop) && stop >= 0 && isFunction(onStop)){
			this.eventHelper.on(`step.${stop}`, onStop);	
			recorded.push([`step.${stop}`, onStop]);
		}
		
		return recorded;
	}
	update(){
		this.eventHelper.consume();
		if(this.debug){
			const [i, r] = divAndMod(this._tic, this._StepPerBeat);
			this.debugDiv.innerText = i + 1;	
		}
	}



	unregisterSequence(records){
		(records||[]).map(([eventName, action])=>{
			this.eventHelper.off(eventName, action);
		});
	}
	_updateInterval(){
		this.interval = 60 * this.__bpm * this.__StepPerBeat;	// 60 / (this._StepPerBeat * this._bpm)
	}
	get step(){
		const [i, rest] = divAndMod(this._tic, this._StepPerBeat);
		return i + rest * this.__StepPerBeat;
	}
	set interval(newValue){
		this._interval = newValue;
		if(this.sloop)this.sloop.interval = this._interval;
	}
	get interval(){
		return this._interval;
	}
	set BPM(newValue){ //beat per minute
		this._bpm = newValue;
		this.__bpm = 1/newValue;
		this._bps = newValue/60;
		this.__bps = 1/this._bps;
		this._updateInterval();
	}
	get BPM(){
		return this._bpm;
	}
	set StepPerBeat(newValue){
		this._StepPerBeat = newValue;
		this.__StepPerBeat = 1/newValue;
		this._updateInterval();
	}
	get StepPerBeat(){
		return this._StepPerBeat;
	}
	play(){
		this.player.play();
		this.sloop.start()
	}
	pause(){
		this.player.pause();
		this.sloop.stop();
		this.unregisterSequence(this._loopEventRecords);
	}
	loop(fromStep, toStep){
		this.pause();
		fromStep = fromStep - 1;
		this.jump(fromStep);
		this._loopEventRecords = this.registerSequence({
			name : "loop",
			stop : toStep,
			onStop : () => this.jump(fromStep)
		});
		this.play();
	}
	jump(step){
		//console.log(step, this.BPM, 0.01666666666667);
		this.player.currentTime = step * this.__bps ;	//convert step to seconds
		this._tic = step * this._StepPerBeat - 1; 		//convert step to tic
	}
}
