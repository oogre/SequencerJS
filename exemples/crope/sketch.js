/*----------------------------------------*\
  beakerProject - sketch.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-04 22:38:59
  @Last Modified time: 2021-02-23 18:19:13
\*----------------------------------------*/

function windowResized(){
	resizeCanvas(window.innerWidth, window.innerHeight);
}

let img;
let cropper, cropper2, cropper3;

function preload(){
	img = loadImage("./../assets/img/00001.cinquantieme.hurlant.jpg");
}

function setup() {
	frameRate(60);
	colorMode(RGB);
	createCanvas(window.innerWidth, window.innerHeight);	
	cropper = new Cropper((mask) => {
		mask.push();
		mask.clear();
		mask.fill(255);
		mask.translate(mask.width>>1, mask.height>>1);
		mask.ellipse(0, 0, mask.width>>1, mask.height>>1);
		mask.pop();
		return mask;
	});

	imageMode(CENTER);
	noSmooth();
}

function draw(){
	clear();
	background(0);

	let i = cropper.crope(img, mouseX, mouseY, 800, 800);
	translate(width>>1, height>>1);
	image(i, 0, 0, 300, 300);

}

function reverseCircle(){
	blendMode(ADD);
	polygone(width, height, 3, width);
	blendMode(DIFFERENCE);
	fill(255);
	ellipse(mouseX, mouseY, 200, 200);
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

/*
let _img = cropper.crope(img, x, y, w, h);
image(_img, 0, 0, 500, 500);
*/
class Cropper{
	constructor(drawer){
		this.drawer = drawer;
		this.width = floor(width);
		this.height = floor(height);
	}
	crope(image, x, y, width, height){
		this.width = floor(width);
		this.height = floor(height);

		image.loadPixels();
		this.pg.loadPixels();
		this.img.loadPixels();
		for(let _y = 0 ; _y < this.img.height ; _y ++){
			for(let _x = 0 ; _x < this.img.width ; _x ++){
				let off = (_y * this.img.width + _x) * 4;
				let imageOff = ((y+_y) * image.width + (x+_x)) * 4;
				this.img.pixels[off + 0] = image.pixels[imageOff + 0] * this.pg.pixels[off + 0];
				this.img.pixels[off + 1] = image.pixels[imageOff + 1] * this.pg.pixels[off + 1];
				this.img.pixels[off + 2] = image.pixels[imageOff + 2] * this.pg.pixels[off + 2];
				this.img.pixels[off + 3] = image.pixels[imageOff + 3] * this.pg.pixels[off + 3];
			}
		}
		this.img.updatePixels();
		return this.img;
	}
	get width (){
		return this._width;
	}
	get height (){
		return this._height;
	}
	set width(value){
		if(value != this.width){
			this._width = value;
			if(this._height){
				if(!this.pg){
					this.pg = createGraphics(this._width, this._height);
					this.pg.pixelDensity(1);
					this.img = createImage(this._width, this._height);
				}else{
					this.pg.resizeCanvas(this._width, this._height);
					this.img.resize(this._width, this._height);
				}
				this.pg = this.drawer(this.pg, this._width, this._height);
			}
		}	
	}
	set height(value){
		if(value != this.height){
			this._height = value;
			if(this._width){
				if(!this.pg){
					this.pg = createGraphics(this._width, this._height);
					this.pg.pixelDensity(1);
					this.img = createImage(this._width, this._height);
				}else{
					this.pg.resizeCanvas(this._width, this._height);
					this.img.resize(this._width, this._height);
				}
				this.pg = this.drawer(this.pg, this._width, this._height);
			}
		}
	}

}
