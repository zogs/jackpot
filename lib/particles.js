/*var test = new ParticleEmitter({
		x: 500,
		y: 300,
		density: 10,
		callback : function() { console.log('callback')},
		magnitude: 10,
		angle: 0,
		spread: Math.PI,
		size: 1,
		scaler: 0.5,
		rotate: 0.1,
		rotatemax: 10,
		//tweens: [[{alpha:0},2000]],
		//forces: [vec2.fromValues(0,0.01)],
		//shapes: [{shape:'star',fill:'#FFF',stroke:0.1,strokeColor:'red',percentage:50},{shape:'circle',fill:null,stroke:0.1,strokeColor:'red',percentage:50}]
	});
	stage.addChild(test);
	createjs.Tween.get(test).to({x:1000},5000);
	*/

(function() {
	
	function Particle(params) {

		this.Container_constructor();

		this.params = params;
		this.position = params.position || new vec2.fromValues(0,0);
		this.velocity = params.velocity || new vec2.fromValues(0,0);
		this.forces = params.forces || [];
		this.acceleration = params.acceleration || new vec2.fromValues(0,0);
		this.scaler = params.scaler || 0;
		this.color = params.color || '#FFF';
		this.size = params.size || 10;
		this.fader = params.fader || 0;
		this.rotate = params.rotate || 0;
		this.tweens = params.tweens || [];
		this.shapes = params.shapes || [];
		this.scale = 1;
		
		this.drawParticle();

		//aplly tweens
		for(var i=0,len=this.tweens.length;i<len;i++) {
			var tween = this.tweens[i];
			createjs.Tween.get(this).to(tween[0],tween[1]);
		}
	}

	var prototype = createjs.extend(Particle, createjs.Container);

	prototype.drawParticle = function() {
		
		if(this.shapes.length == 0) {
			var shape = new createjs.Shape();
			shape.graphics.beginFill('#FFF').drawCircle(0,0,this.size);
		}
		else if(this.shapes.length == 1) {
			var shape = this.createShape(this.shapes[0]);
		}
		else {
			var rand = Math.random() * 100;
			var pc = 0;
			for(var i=0,len=this.shapes.length;i<len;i++) {
				var pc = pc + this.shapes[i].percentage;
				if( rand <= pc) {
					var shape = this.createShape(this.shapes[i]);
					break;
				}
			}
		}
		shape.x = - this.size/2;
		shape.y = - this.size/2;
		this.addChild(shape);
	}

	prototype.createShape = function(config) {

		var shape = new createjs.Shape();
		var k = shape.graphics;			
		if(config.stroke) k.setStrokeStyle(config.stroke);
		if(config.strokeColor) k.beginStroke(config.strokeColor);
		if(config.fill) k.beginFill(config.fill);
		if(config.shape == 'circle') k.drawCircle(0,0,this.size);
		if(config.shape == 'rect') k.drawRect(0,0,this.size,this.size);
		if(config.shape == 'ellipse') k.drawEllipse(0,0,this.size,this.size);
		if(config.shape == 'star') k.drawPolyStar(0,0,this.size,5,0.5);		

		return shape;
	}

	prototype.move = function() {

		this.alpha -= this.fader;
		if(this.alpha<=0) this.alpha = 0;
		
		this.rotation += this.rotate;

		this.scale = this.scale + this.scaler;
		this.scaleX = this.scaleY = this.scale;


		for(var i=0,len=this.forces.length;i<len;i++) {

			vec2.add(this.acceleration,this.acceleration,this.forces[i]);
		}

		vec2.add(this.velocity,this.velocity,this.acceleration);

		vec2.add(this.position,this.position,this.velocity);

		this.x = this.position[0];
		this.y = this.position[1];

	}

	prototype.addMove = function(vec) {

		vec2.add(this.position,this.position,vec);
		this.x = this.position[0];
		this.y = this.position[1];
	}

	window.Particle = createjs.promote(Particle,'Container');

}());

(function() {

	function ParticleEmitter(params) {

		this.Container_constructor();
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.position = vec2.fromValues(0,0);
		this.duration = params.duration || null;
		this.velocity = params.velocity || null;
		this.forces = params.forces || [];
		this.angle = params.angle || 0;
		this.magnitude = params.magnitude || 10;
		this.magnitudemax = params.magnitudemax || this.magnitude;
		this.spread = params.spread || 0;
		this.color = params.color || "#FFF";
		this.size = params.size || 1;
		this.sizemax = params.sizemax || this.size;
		this.fader = params.fader || 0;
		this.fadermax = params.fademax || this.fader;
		this.rotate = params.rotate || 0;
		this.rotatemax = params.rotatemax || this.rotate;
		this.scaler = params.scaler || 0;
		this.frequency = params.frequency || 100;
		this.density = params.density || 1;
		this.callback = params.callback || function() {};
		this.tweens = params.tweens || [];
		this.shapes = params.shapes || [];
		this.totalTime = 0;
		this.paused = false;


		this.particles_cont = new createjs.Container();
		this.addChild(this.particles_cont);

		this.addEventListener('tick',proxy(this.tick,this));

		this.cleaner = window.setInterval(proxy(this.cleanParticles,this),1000);

		if(this.duration) this.timer = window.setInterval(proxy(this.timing,this),this.frequency);
		else this.emitParticles(this.density);
	}

	var prototype = createjs.extend(ParticleEmitter, createjs.Container);
	createjs.EventDispatcher.initialize(prototype);

	prototype.timing = function() {

		this.totalTime += this.frequency;

		this.emitParticles(this.density);

		if(this.totalTime > this.duration) {

			window.clearInterval(this.timer);			
		}
	}

	prototype.emitParticles = function(n) {

		for(var i=0; i < n; i++) {
			var particule = this.createParticle();
			this.particles_cont.addChild(particule);
		}
	}

	prototype.createParticle = function() {

		var angle = this.angle + this.spread - (Math.random()*this.spread*2);
		var magnitude = this.magnitude + Math.random()*(this.magnitudemax - this.magnitude);

		//if velicity is set, override angle and magnitude
		if(this.velocity !== null) {
			// Use an angle randomized over the spread so we have more of a "spray"
			var angle = Math.atan2(this.velocity[1],this.velocity[0]) + this.spread - (Math.random() * this.spread * 2);		
			// The magnitude of the emitter's velocity
			var magnitude = vec2.length(this.velocity);
		}

		// The emitter's position
		var position = vec2.fromValues(this.position[0], this.position[1]);
		
		// New velocity based off of the calculated angle and magnitude
		var velocity = vec2.fromValues(magnitude * Math.cos(angle), magnitude * Math.sin(angle));

		var size = this.size + Math.random()*(this.sizemax - this.size);

		var fader = this.fader + Math.random() * (this.fadermax - this.fader);

		var rotate = this.rotate + Math.random() * (this.rotatemax - this.rotate);
		// return our new Particle!
		return new Particle({
			position: position,
			velocity: velocity,
			color: this.color,
			size: size,
			fader: fader,
			rotate: rotate,
			scaler: this.scaler,
			forces: this.forces,
			tweens: this.tweens,
			shapes: this.shapes,
		});
	}

	prototype.setPaused = function(bool) {

		this.paused = (bool === true)? true : false;
		return this;
	}

	prototype.tick = function() {

		if(this.paused) return;

		this.moveParticles();
	}

	prototype.moveParticles = function() {

		if(this.particles_cont.numChildren == 0) return;

		var i = this.particles_cont.numChildren - 1;
		while(i >= 0) {

			var particle = this.particles_cont.getChildAt(i);

			particle.move();

			i--;
		}
	}

	prototype.cleanParticles = function() {

		if(this.paused) return;

		var i = this.particles_cont.numChildren - 1;		
		while(i >= 0) {

			var particle = this.particles_cont.getChildAt(i);

			if(particle.alpha <= 0) this.particles_cont.removeChildAt(i);
			if(particle.y + this.y - particle.scale <= 0) this.particles_cont.removeChildAt(i);
			if(particle.y + this.y - particle.scale >= stage.canvas.height) this.particles_cont.removeChildAt(i);
			if(particle.x + this.x - particle.scale <= 0) this.particles_cont.removeChildAt(i);
			if(particle.x + this.x - particle.scale >= stage.canvas.width) this.particles_cont.removeChildAt(i);
			
			particle = null;

			i--;
		}



		if(this.particles_cont.numChildren === 0) {
			
			window.clearInterval(this.cleaner);
			createjs.Ticker.removeEventListener("tick", this.tick);
			this.removeAllChildren();
			this.callback(this);

		}
	}

	window.ParticleEmitter = createjs.promote(ParticleEmitter,'Container');
}());