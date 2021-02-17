"use strict";

require("core-js/modules/es6.symbol.js");

require("core-js/modules/web.dom.iterable.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _AudioPlayer = _interopRequireDefault(require("./AudioPlayer.js"));

var _EventHelper = _interopRequireDefault(require("./EventHelper.js"));

var _Tools = require("./Tools.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Sequencer {
  constructor(audioPath, BPM) {
    let debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    this.player = new _AudioPlayer.default(audioPath);
    this.eventHelper = new _EventHelper.default();
    this.BPM = BPM;
    this.StepPerBeat = 24;
    this._tic = 0;
    this.currentStep = 0;
    this.sloop = new p5.SoundLoop(cycleStartTime => {
      this.currentStep = this.step;
      this.eventHelper.trigger("step.".concat(this.currentStep), {
        step: this.currentStep
      });
      this._tic++;
    }, this.interval);
    this.eventDict = {};
    this.playBtn = document.createElement("button");
    this.playBtn.innerText = "play";
    this.playBtn.style.position = "absolute";
    this.playBtn.style.top = "50%";
    this.playBtn.style.left = "50%";
    this.playBtn.style.transform = "translate(-50%, -50%)";
    document.body.append(this.playBtn);
    document.querySelector("button").addEventListener("click", event => {
      this.playBtn.parentElement.removeChild(this.playBtn);
      sequencer.play();
    });

    if (debug) {
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

  registerSequence() {
    let {
      name,
      start = 1,
      onStart,
      stop = 10,
      onStop,
      measure = 1,
      steps = [1],
      onStep = () => {}
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    start = start - 1;
    let recorded = [];

    let _onStep = event => {
      onStep(_objectSpread({
        amount: (event.step - start) / (stop - start - 1)
      }, event));
    };

    if (Number.isInteger(start) && start >= 0 && (0, _Tools.isFunction)(onStart)) {
      this.eventHelper.on("step.".concat(start), onStart);
      recorded.push(["step.".concat(start), onStart]);
    }

    let n = 0;

    for (let j = start; j < stop; j++) {
      for (let i = 0; i < this._StepPerBeat; i++) {
        let a = i / this._StepPerBeat;
        let r_step = 1 + n % measure + a;
        let step = start + n + a;

        if (steps.includes(r_step)) {
          this.eventHelper.on("step.".concat(step), _onStep);
          recorded.push(["step.".concat(step), _onStep]);
        }
      }

      n++;
    }

    if (Number.isInteger(stop) && stop >= 0 && (0, _Tools.isFunction)(onStop)) {
      this.eventHelper.on("step.".concat(stop), onStop);
      recorded.push(["step.".concat(stop), onStop]);
    }

    return recorded;
  }

  update() {
    this.eventHelper.consume();

    if (this.debug) {
      const [i, r] = (0, _Tools.divAndMod)(this._tic, this._StepPerBeat);
      this.debugDiv.innerText = i + 1;
    }
  }

  unregisterSequence(records) {
    (records || []).map((_ref) => {
      let [eventName, action] = _ref;
      this.eventHelper.off(eventName, action);
    });
  }

  _updateInterval() {
    this.interval = 60 * this.__bpm * this.__StepPerBeat; // 60 / (this._StepPerBeat * this._bpm)
  }

  get step() {
    const [i, rest] = (0, _Tools.divAndMod)(this._tic, this._StepPerBeat);
    return i + rest * this.__StepPerBeat;
  }

  set interval(newValue) {
    this._interval = newValue;
    if (this.sloop) this.sloop.interval = this._interval;
  }

  get interval() {
    return this._interval;
  }

  set BPM(newValue) {
    //beat per minute
    this._bpm = newValue;
    this.__bpm = 1 / newValue;
    this._bps = newValue / 60;
    this.__bps = 1 / this._bps;

    this._updateInterval();
  }

  get BPM() {
    return this._bpm;
  }

  set StepPerBeat(newValue) {
    this._StepPerBeat = newValue;
    this.__StepPerBeat = 1 / newValue;

    this._updateInterval();
  }

  get StepPerBeat() {
    return this._StepPerBeat;
  }

  play() {
    this.player.play();
    this.sloop.start();
  }

  pause() {
    this.player.pause();
    this.sloop.stop();
    this.unregisterSequence(this._loopEventRecords);
  }

  loop(fromStep, toStep) {
    this.pause();
    fromStep = fromStep - 1;
    this.jump(fromStep);
    this._loopEventRecords = this.registerSequence({
      name: "loop",
      stop: toStep,
      onStop: () => this.jump(fromStep)
    });
    this.play();
  }

  jump(step) {
    //console.log(step, this.BPM, 0.01666666666667);
    this.player.currentTime = step * this.__bps; //convert step to seconds

    this._tic = step * this._StepPerBeat - 1; //convert step to tic
  }

}

exports.default = Sequencer;