var stage;
var queue;
var MOUSE_X;
var MOUSE_Y;
var MOUSE_POINTS = [];
var CONFIG = {};
var GAME = {};

window.loaded = function() {


	console.log('loaded');
	stage = new createjs.Stage('canvas');

	queue = new createjs.LoadQueue();
	queue.addEventListener('complete',initialize);
	queue.loadManifest([
			{id: 'fruits', src: 'assets/img/fruits.png'},
			{id: 'board', src: 'assets/img/board.png'},
			{id: 'lightening', src: 'assets/img/lightening.png'},
			{id: 'shader', src: 'assets/img/shader.png'},
			{id: 'slot', src: 'assets/img/board_slot.png'},
			{id: 'slot_empty', src: 'assets/img/board_slot_empty.png'},
			{id: 'lever', src: 'assets/img/board_lever.png'},
			{id: 'jackpot', src: 'assets/img/jackpot.png'},
			{id: 'starburst', src: 'assets/img/starburst.png'},
			{id: 'coin', src: 'assets/img/coin.png'},
			{id: 'icon_swipe', src: 'assets/img/icon_swipe.png'},
			{id: 'icon_close', src: 'assets/img/icon_close.png'}
		]);
}


window.initialize = function() {

	console.log('init');

	HEIGHT = stage.canvas.height;
	WIDTH = stage.canvas.width;

	var background = new createjs.Shape();
	background.graphics.beginFill('#343740').drawRect(0,0,WIDTH,HEIGHT);
	stage.addChild(background);

	var light = new createjs.Bitmap(queue.getResult('lightening'));
	stage.addChild(light);

	var line = new createjs.Shape();
	var middle_y = HEIGHT / 2 - 50;
	line.graphics.beginStroke('#444').setStrokeStyle(2).moveTo(0,0).lineTo(WIDTH,0);
	line.y = middle_y;
	stage.addChild(line);
	CONFIG.center_line = line;

	CONFIG.fruit_list = ['citron','treffle','diamond','cerise','peche','seven','radis','courge','cloche'];
	CONFIG.fruit_list_ordered = ['citron','cerise','peche','radis','courge','cloche','treffle','seven','diamond'];
	CONFIG.fruit_size = 185;
	CONFIG.fruits = new createjs.SpriteSheet({
		images: [queue.getResult('fruits')],
		frames: { width: CONFIG.fruit_size, height: CONFIG.fruit_size},
		animations: {
			'citron':0,'treffle':1,'diamond':2,'cerise':3,'peche':4,'seven':5,'radis':6,'courge':7,'cloche':8
		},
	});
	CONFIG.coins = new createjs.SpriteSheet({
		images: [queue.getResult('coin')],
		frames: { width: 110, height: 110, regX: 55, regY: 55},
		animations: {
			'face': 3,
			'side': 1,
			'drop': [0,4,'drop',0.5],
		},
	});

	GAME.try = 0;
	GAME.board = {};
	GAME.board.items = [];
	GAME.board.fruits = [];
	GAME.listener = {};
	GAME.screen = {};
	GAME.user = {};
	GAME.user.score = 0;
	GAME.scoring = {
		'citron' : [0,1,100,1000],
		'treffle' : [0,5,500,5000],
		'diamond' : [0,10,1000,10000],
		'cerise' : [0,1,100,1000],
		'peche' : [0,1,100,1000],
		'seven' : [0,7,700,7000],
		'radis' : [0,1,100,1000],
		'courge' : [0,1,100,1000],
		'cloche' : [0,3,300,3000],
	}


	var wheel = new createjs.Container();	

	var sub1 = createWheel(CONFIG.fruits,CONFIG.fruit_list);
	var sub2 = createWheel(CONFIG.fruits,CONFIG.fruit_list);
	var dy = 0;// Math.random()*1300;
	sub1.y = - dy;
	sub1.x = 0;
	sub2.y = sub1.y + sub2.height;
	sub2.x = 0;
	wheel.addChild(sub1);
	wheel.addChild(sub2);
	var shader = new createjs.Bitmap(queue.getResult('shader'));
	wheel.addChild(shader);
	stage.addChild(wheel);	
	GAME.screen.wheel = wheel;


	//SCREEN
	var overlay = new createjs.Container();
	stage.addChild(overlay);
	GAME.screen.overlay = overlay;



	//BOARD

	var board = new createjs.Container();
	stage.addChild(board);
	GAME.screen.board = board;

	var bkg =  new createjs.Bitmap(queue.getResult('board'));
	bkg.y = HEIGHT - bkg.image.height;
	board.addChild(bkg);

	var slot1 = new createjs.Bitmap(queue.getResult('slot_empty'));
	slot1.y = bkg.y + 45;
	slot1.x = 30;
	board.addChild(slot1);
	GAME.board.slot1 = slot1;


	var slot2 = new createjs.Bitmap(queue.getResult('slot_empty'));
	slot2.y = slot1.y
	slot2.x = slot1.x + slot1.image.width + 15;
	board.addChild(slot2);
	GAME.board.slot2 = slot2;

	var slot3 = new createjs.Bitmap(queue.getResult('slot_empty'));
	slot3.y = slot1.y
	slot3.x = slot2.x + slot2.image.width + 15;
	board.addChild(slot3);
	GAME.board.slot3 = slot3;

	var lever = new createjs.Bitmap(queue.getResult('lever'));
	lever.x = slot3.x + slot3.image.width + 15;
	lever.y = slot3.y - 5;
	board.addChild(lever);

	var score = new createjs.Text(GAME.user.score+' $','14px Times Serif','white');
	score.textAlign = 'right';
	score.x = bkg.x + 220;
	score.y = bkg.y + 10;
	board.addChild(score);
	GAME.board.score = score;	



	stage.update();

	createjs.Ticker.addEventListener('tick',tick);

	stage.addEventListener('stagemousemove',onMouseMove);
	stage.addEventListener('item_selected',onItemSelected);

	//INIT EVENTS
	//initScrollEventListeners();
	displayWelcomeScreen();
}

window.displayWelcomeScreen = function() {

	var cont = new createjs.Container();
	stage.addChild(cont);

	var width = WIDTH - 100;
	var height = 360;
	var bg = new createjs.Shape();
	bg.graphics.beginFill('rgba(0,0,0,0.5').drawRoundRect(0,0,width,height,10,10,10,10);
	bg.x = (WIDTH - width)/2;
	bg.y = 10;
	cont.addChild(bg);

	var title = new createjs.Bitmap(queue.getResult('jackpot'));
	title.y = bg.y + 10;
	cont.addChild(title);

	var icon = new createjs.Bitmap(queue.getResult('icon_swipe'));
	icon.regX = icon.regY = 40;
	icon.x = bg.x + 60;
	icon.y = title.y + 150;
	icon.scaleX = icon.scaleY = 0.7;
	cont.addChild(icon);
	createjs.Tween.get(icon,{loop:true}).wait(1000).to({rotation: - 35},250).to({rotation: 0},250);
	var text = new createjs.Text('','12px Sans-Serif','white');
	text.lineWidth = 150;
	text.text = 'Utilise le doigt (ou la souris) pour faire tourner la roue';
	text.x = icon.x + 35;
	text.y = icon.y - 20;
	cont.addChild(text);

	var item = new createjs.Sprite(CONFIG.fruits,'seven');
	item.regX = item.regY = 90;
	item.scaleX = item.scaleY = 0.3;
	item.x = icon.x;
	item.y = icon.y + 80;
	cont.addChild(item);
	createjs.Tween.get(item,{loop:true}).wait(1250).to({scaleX: 0.4, scaleY: 0.4},150).to({scaleX:0.3, scaleY:0.3}, 100);
	var text = new createjs.Text('','12px Sans-Serif','white');
	text.lineWidth = 150;
	text.text = 'Gagne le Jackpot en alignant 3 symboles a la suite !';
	text.x = item.x + 35;
	text.y = item.y - 20;
	cont.addChild(text);

	var coin = new createjs.Sprite(CONFIG.coins,'drop');
	coin.scaleX = coin.scaleY = 0.45;
	coin.x = icon.x +5 ;
	coin.y = item.y + 40 + coin.spriteSheet._frameHeight/4;
	cont.addChild(coin);
	var text = new createjs.Text('','12px Sans-Serif','white');
	text.lineWidth = 150;
	text.text = 'Fait pleuvoir les dollars !';
	text.x = item.x + 35;
	text.y = coin.y - 5;
	cont.addChild(text);

	var button = new createjs.Shape();
	button.graphics.beginFill('rgba(0,0,0,0.5)').drawRoundRect(0,0,width,50,10,10,10,10);
	button.x = bg.x;
	button.y = 380;
	cont.addChild(button);
	var text = new createjs.Text('JOUER','bold 24px Sans-Serif','white');
	text.textAlign = 'center';
	text.x = WIDTH/2;
	text.y = button.y + 10;
	cont.addChild(text);

	button.on('pressup',function(evt){
		evt.stopImmediatePropagation();
		evt.remove();
		cont.removeAllChildren();
		stage.removeChild(cont);
		resetBoard();
	},null,true);
}

window.displayScoreScreen = function() {

	var cont = new createjs.Container();
	stage.addChild(cont);

	var width = WIDTH - 100;
	var height = 450;
	var bkg = new createjs.Shape();
	bkg.graphics.beginFill('rgba(0,0,0,0.5)').drawRoundRect(0,0,width,height,10,10,10,10);
	bkg.x = (WIDTH - width)/2;
	bkg.y = 10;
	cont.addChild(bkg);

	var title = new createjs.Text('SCORE SUMMARY','14px Sans-Serif','white');
	title.x = bkg.x + 70;
	title.y = bkg.y + 30;
	cont.addChild(title);

	for(let j=2; j <= 3; j++) {
		
		var x = (j==2)? bkg.x + 20 : bkg.x + 140;

		for(let i=0; i < CONFIG.fruit_list_ordered.length; i++) {

			let fruit = CONFIG.fruit_list_ordered[i];
			let item = new createjs.Sprite(CONFIG.fruits,fruit);
			item.x = x;
			item.y = bkg.y + 60 + i * 40;
			item.scaleX = item.scaleY = 0.2;
			cont.addChild(item);

			let score = 'x'+j+' = '+GAME.scoring[fruit][j];
			let text = new createjs.Text(score,'12px Sans-Serif','white');
			text.textAlign = 'left';
			text.x = item.x + 40;
			text.y = item.y + 13;
			cont.addChild(text);
		}
	}

}

window.tick = function() {

	stage.update(40);
}

window.initScrollEventListeners = function() {

	GAME.listener.startScroll = stage.on('mousedown', startScroll);
	GAME.listener.endScroll = stage.on('pressup', endScroll);
}

window.removeScrollEventListeners = function() {

	stage.off('mousedown', GAME.listener.startScroll);
	stage.off('pressup', GAME.listener.endScroll);
}

window.startScroll = function(e) {

	GAME.initMouseY = e.stageY;
	GAME.initY = GAME.screen.wheel.getChildAt(0).y;
	GAME.listener.scroll_drag = stage.on('tick',proxy(rollWheel,this));
}

window.endScroll = function(e) {

	//end scroll
	stage.off('tick',GAME.listener.scroll_drag);

	//check minimum effort
	if(GAME.screen.wheel.velocity < 50) {
		//replace the wheel to previous position
		rollWheelBack();
		return;
	}

	//disable events listener to prevent user action
	removeScrollEventListeners();


	//launch continuous inertia until total stop
	GAME.listener.scroll_inertia = stage.on('tick',proxy(rollWheelInertia,window));
	GAME.listener.scroll_inertia_zero = stage.on('wheel_inertia_zero', proxy(rollFinalAjustment,this), null, true);
}

window.createWheel = function(fruits,list) {

	var cont = new createjs.Container();
	var n = fruits._numFrames;

	for(var i=0; i<n; i++) {
		let fruit = new createjs.Sprite(fruits,list[i]);
		var scale = 1;
		fruit.scaleX = fruit.scaleY = scale;
		fruit.x = 90 * scale;
		fruit.y = i * 185 * scale;
		cont.addChild(fruit);
	}
	cont.height = n * 185 * scale;

	return cont;
}

window.rollWheel = function() {	

	var wheel = GAME.screen.wheel;
	var sub1 = wheel.getChildAt(0);
	var sub2 = wheel.getChildAt(1);

	var y1 = sub1.y;
	var y2 = sub2.y;

	sub1.y = GAME.initY + MOUSE_Y - GAME.initMouseY;

	if(sub1.y > 0) sub2.y = sub1.y - sub1.height;
	else sub2.y = sub1.y + sub1.height

	wheel.velocity = sub1.y - y1;

	if(sub1.y < - sub1.height) {
		sub1.y = sub1.height;
		wheel.setChildIndex(sub1,1);
	}

	if(sub2.y > sub2.height) {
		sub2.y = - sub2.height;
		wheel.setChildIndex(sub2,0);
	}

}

window.rollWheelInertia = function() {

	var wheel = GAME.screen.wheel;
	var sub1 = wheel.getChildAt(0);
	var sub2 = wheel.getChildAt(1);

	sub1.y += wheel.velocity;
	sub2.y = sub1.y + sub1.height;

	if(wheel.velocity > 0) wheel.velocity -= 1;
	if(wheel.velocity < 0) wheel.velocity += 1;

	if(sub1.y < - sub1.height) {
		sub1.y = sub1.height;
		wheel.setChildIndex(sub1,1);
	}

	if(sub2.y > sub2.height) {
		sub2.y = - sub2.height;
		wheel.setChildIndex(sub2,0);
	}

	if(wheel.velocity <= 0) {

		stage.off('tick',GAME.listener.scroll_inertia);
		stage.dispatchEvent('wheel_inertia_zero');
	}

}

window.rollFinalAjustment = function(evt) {

	evt.remove();

	var wheel = GAME.screen.wheel;
	var line = CONFIG.center_line;

	var items = [];
	for(var i=0; i< wheel.numChildren; i++) {
		var sub = wheel.getChildAt(i);
		for(var j=0; j<sub.numChildren; j++) {
			var el = sub.getChildAt(j);
			var pos = el.y + sub.y + wheel.y + CONFIG.fruit_size/2;
			var item = {
				el: el,
				pos: pos
			};
			items.push(item);
		}
	}

	var ordered = [];
	var distances = [];
	for(let i=0; i<items.length;i++) {
		var item = items[i];
		var pos = item.pos;
		var el = item.el;
		var dist = Math.abs(line.y - pos); 
		el.dist = dist;
		el.delta = line.y - pos;
		if(ordered.length==0) {
			ordered.push(el);
			distances.push(dist);
		}
		if(dist > distances[0]) {
			ordered.push(el);
			distances.push(dist);
		}
		else {
			ordered.unshift(el);
			distances.unshift(dist);
		}
	}

	var closer = ordered[0];
	var delta = closer.delta;
	var dist = closer.dist;

	var sub1 = wheel.getChildAt(0);
	var sub2 = wheel.getChildAt(1);
	createjs.Tween.get(sub1).to({y:sub1.y + delta},dist*10,createjs.Ease.bounceOut);
	createjs.Tween.get(sub2).to({y:sub2.y + delta},dist*10,createjs.Ease.bounceOut)
		.call(proxy(rollWheelOver,this,[closer]));

}

window.rollWheelBack = function() {

	var wheel = GAME.screen.wheel;
	var sub1 = wheel.getChildAt(0);
	var sub2 = wheel.getChildAt(1);

	var initY = GAME.initY;
	var delta = initY - sub1.y;

	createjs.Tween.get(sub1).to({y: sub1.y + delta}, 500, createjs.Ease.bounceOut);
	createjs.Tween.get(sub2).to({y: sub2.y + delta}, 500, createjs.Ease.bounceOut);
}

window.rollWheelOver = function(item) {

	//re-init scroll events
	initScrollEventListeners();

	//dispatch item selected
	var event = new createjs.Event('item_selected');
	event.item = item.currentAnimation;
	stage.dispatchEvent(event);
}

window.onItemSelected = function(event) {

	var item = event.item;
	GAME.try++;

	updateItemSlot(item,GAME.try);

}

window.updateItemSlot = function(item, number) {
	let slot;
	if(number == 1) slot = GAME.board.slot1;
	if(number == 2) slot = GAME.board.slot2;
	if(number == 3) slot = GAME.board.slot3;

	let fruit = new createjs.Sprite(CONFIG.fruits,item);
	fruit.x =  slot.x;
	fruit.y =  slot.y;
	fruit.scaleX = fruit.scaleY = 0.4;
	stage.addChild(fruit);

	GAME.board.items.push(item);
	GAME.board.fruits.push(fruit);

	if(number == 3) {
		computeItemsResult();
	}
}

window.computeItemsResult = function() {

	var items = GAME.board.items;

	var countItems = countElements(items);

	//calcul each gains
	var gains = [];
	var dones = {};
	var jackpot = null;
	for(let i=0; i < GAME.board.items.length; i++) {		
		let item = GAME.board.items[i];
		if(dones[item] == undefined) {
			let count = countItems[item];
			if(count >= 3) var jackpot = true;
			let score = GAME.scoring[item][count];
			dones[item] = score;
			gains.push(score);					
		}
	}

	//calcul total gain
	var gain = gains.reduce(function(a,b){ return a+b;},0);

	//display each gains
	for(var i=0; i < gains.length; i++) {

		let text = new createjs.Text('+ '+gains[i]+' $','14px Times Serif', 'white');
		text.textAlign = 'right';
		text.x = GAME.board.score.x + 100;
		text.y = GAME.board.score.y - 20;
		text.alpha = 0;
		let delay = i*400;
		stage.addChild(text);
		createjs.Tween.get(text).wait(delay).to({alpha:1},0).to({ y: text.y - 70, alpha:0},1500)
			.call(function() { this.parent.removeChild(this); })
		;
	}

	//display total gain
	console.log(items,gains,gain);
	GAME.user.score += gain;
	GAME.board.score.text = GAME.user.score+' $';


	if(jackpot == true) {

		initJackpotScreen(gain);
	}
	else {

		initContinueScreen();
	}


	removeScrollEventListeners();

}

window.resetBoard = function() {

	for(let i=0; i< GAME.board.fruits.length; i++) {
		var fruit = GAME.board.fruits[i];
		stage.removeChild(fruit);
	}

	GAME.try = 0;
	GAME.board.items = [];
	GAME.board.fruits = [];
console.log('resetBoard');
	initScrollEventListeners();

}

window.initContinueScreen = function() {

	var cont = GAME.screen.overlay;
	cont.removeAllChildren();

	let button = new createjs.Container();
	button.x = 110;
	button.y = stage.canvas.height / 2 - 100;
	button.mouseEnabled = true;
	let rect = new createjs.Shape();
	rect.graphics.beginFill('rgba(0,0,0,0.5').drawRoundRect(0,0,140,40,5,5,5,5);
	button.addChild(rect);
	let text = new createjs.Text('CONTINUE',"20px Arial","#FFF");
	text.x = 20;
	text.y = 10;
	button.addChild(text);
	cont.addChild(button);
	stage.on('pressup',function(evt){ 
		evt.stopImmediatePropagation();
		evt.remove();
		cont.removeAllChildren();
		resetBoard();
	});
}

window.initJackpotScreen = function(gain) {

	let cont = GAME.screen.overlay;
	cont.removeAllChildren();

	let coin_cont = new createjs.Container();
	let star_cont = new createjs.Container();
	let part_cont = new createjs.Container();
	let jack_cont = new createjs.Container();
	let butt_cont = new createjs.Container();
	butt_cont.alpha = 0;

	cont.addChild(coin_cont);
	cont.addChild(star_cont);
	cont.addChild(part_cont);
	cont.addChild(jack_cont);
	cont.addChild(butt_cont);

	let star = new createjs.Bitmap(queue.getResult('starburst'));
	star.regX = star.regY = 400;
	star.scaleX = star.scaleY = 0.8;
	star.x = WIDTH/2;
	star.y = 800;
	star.scaleX = star.scaleY = 0.3;
	star.alpha = 0;
	star_cont.addChild(star);
	createjs.Tween.get(star).to({alpha:1,y:500,scaleX:0.8,scaleY:0.8},500,createjs.Ease.quartOut);
	createjs.Tween.get(star,{loop:true}).to({rotation:180},1000);


	let jackpot = new createjs.Bitmap(queue.getResult('jackpot'));
	jackpot.x = 0;
	jackpot.y = 600;
	jack_cont.addChild(jackpot);
	createjs.Tween.get(jackpot).to({y:360,scaleX:1,scaleY:1},600,createjs.Ease.bounceOut);

	let nb_coin = 10;
	if(gain) nb_coin = gain / 50;
	console.log(nb_coin+' coins');
	while(nb_coin>0) {
		let coin = new createjs.Sprite(CONFIG.coins,'drop');
		coin.gotoAndPlay(Math.floor(Math.random()*5));
		coin.x = Math.random() * (stage.canvas.width);
		coin.y = - 200;
		coin.rotation = Math.random() * 360;
		let delay = Math.random() * 100 * nb_coin;
		coin_cont.addChild(coin);
		createjs.Tween.get(coin).wait(delay).to({ y: 700 },2000)
			.wait(500).call(function() {
				//display button 
				butt_cont.alpha = 1;
				//remove coin
				coin_cont.removeChild(this);
			})
		;
		nb_coin--;
	}

	let particles = new ParticleEmitter({
		x: WIDTH/2,
		y: 360,
		density: 10,
		duration: 10000,
		frequency: 300,
		callback : function() { },
		magnitude: 10,
		angle: 0,
		spread: Math.PI,
		size: 1,
		scaler: 1,
		rotate: 0.1,
		rotatemax: 10,
		//tweens: [[{alpha:0},2000]],
		forces: [vec2.fromValues(0,0.1)],
		shapes: [{shape:'star',fill:'yellow',stroke:0.1,strokeColor:'white',percentage:100}]
	});
	part_cont.addChild(particles);

	let button = new createjs.Container();
	button.x = 110;
	button.y = stage.canvas.height / 2 - 100;
	button.mouseEnabled = true;
	let rect = new createjs.Shape();
	rect.graphics.beginFill('rgba(0,0,0,0.5').drawRoundRect(0,0,140,40,5,5,5,5);
	button.addChild(rect);
	let text = new createjs.Text('REJOUER',"20px Arial","#FFF");
	text.x = 20;
	text.y = 10;
	button.addChild(text);
	butt_cont.addChild(button);
	button.on('pressup',function(){ 
		evt.stopImmediatePropagation();
		evt.remove();
		cont.removeAllChildren();
		resetBoard();
	},null,true);

}

window.onMouseMove = function(e) {

	MOUSE_X = e.stageX;
	MOUSE_Y = e.stageY;

	var pt = new createjs.Point(MOUSE_X,MOUSE_Y);
	MOUSE_POINTS.unshift(pt);
	MOUSE_POINTS = MOUSE_POINTS.slice(0,10);

}