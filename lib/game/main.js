ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

    'game.entities.lightBall',
    'game.entities.lightBallRed',
    'game.entities.heart',

    'game.levels.default'
)
.defines(function(){

MyGame = ig.Game.extend({
	font: new ig.Font( 'media/courier_new_24_white_stroked_blue.png' ),

    time: 0,
    spawnRightSide: false,
    score: 0,
    progressBarScore: 0,
    level: 1,
    lives: 3,
    
    gameOver: false,

	init: function() {
        this.startTime = new Date().getTime();
        this.initInput();
        this.trackSwipeEvents();
        this.loadLevel(LevelDefault);
        this.spawnHearts();
	},

    spawnHearts: function() {
        for (var i=0;i<this.lives;i++) {
            var padding = 5;
            var borderWidth = 3;
            var scale = ig.system.scale;
            var middle = (ig.system.width / 2);
            var halfLevelBarWidth = ig.system.width / 4 ;
            var spawnX = middle + halfLevelBarWidth + padding + borderWidth + ((24+padding)*i);
            var spawnY = 9;
            ig.game.spawnEntity(EntityHeart,spawnX,spawnY);
        }
    },

    initInput: function() {
        ig.input.initMouse();
        var game = this;
        if (!ig.ua.mobile) {
            ig.input.bind(ig.KEY.MOUSE1,'click');
        } else {
            document.getElementById('canvas').addEventListener('touchstart',function(touchEvent) {
                var x = touchEvent.touches[0].clientX;
                var y = touchEvent.touches[0].clientY;
                if (!game.gameOver) {
                    game.handleClick(x,y);
                }
            });
        }
    },

	update: function() {
		this.parent();
        this.time++;
        this.addScore(1);
        if (ig.input.pressed('click')) {
            this.handleClick(ig.input.mouse.x,ig.input.mouse.y);
        }
        this.checkDeath();
        this.handleSpawn();
	},

    handleSpawn: function() {
        var random = Math.random();
        if (this.shouldSpawn()) {
            do {
            var spawnLocation = this.getRandomSpawnLocation();
            } while (this.intersectsLightBall(spawnLocation));
            if (Math.random() < 0.05) {
                ig.game.spawnEntity(EntityLightBallRed,spawnLocation.x,spawnLocation.y);
            } else {
                ig.game.spawnEntity(EntityLightBall,spawnLocation.x,spawnLocation.y);
            }
        }
    },

    intersectsLightBall: function(spawnLocation) {
        var lightBalls = this.getEntitiesByType( EntityLightBall );

        var ax1 = spawnLocation.x;
        var ay1 = spawnLocation.y;
        for (var i=0;i<lightBalls.length;i++) {
            var lightBall = lightBalls[i];
            var size = lightBalls[0].size.x;

            var ax2 = spawnLocation.x + size;
            var ay2 = spawnLocation.y + size;
            var bx1 = lightBall.pos.x;
            var by1 = lightBall.pos.y;
            var bx2 = lightBall.pos.x + size;
            var by2 = lightBall.pos.y + size;

            if (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1) {
                return true;
            }
        }
        return false;
    },

    getRandomSpawnLocation: function() {
        var randX = Math.random()*((ig.system.width/2)-64);
        if (this.spawnRightSide) {
            randX += (ig.system.width/2);
        }
        this.spawnRightSide = !this.spawnRightSide;
        var randY = Math.random()*(ig.system.height-128)+64;
        return {x: randX, y: randY};
    },

    shouldSpawn: function() {
        //var spawnFrequency = 40 - parseInt(Math.floor(this.timeSinceStart())/5);
        //var spawnFrequency = (-1)*Math.pow((75*x),(1/3))+40
        //http://www.wolframalpha.com/input/?i=%28-%2875*x%29%5E%281%2F5%29%29*3.7%2B40+graph+from+0+to+240
        var x = this.timeSinceStart();
        var spawnFrequency = 40-8.77433*Math.pow(x,(1/5));
        spawnFrequency = parseInt(Math.floor(spawnFrequency))
        if (this.time % spawnFrequency == 0) {
            return true;
        } else {
            return false;
        }
    },

    handleClick: function(x,y) {
        var lightBalls = ig.game.getEntitiesByType(EntityLightBall);
        for (var i=lightBalls.length-1;i>=0;i--) {
            var lightBall = lightBalls[i];
            var clickResponse = lightBall.userClick(x,y);
            if (clickResponse.handled) {
                this.addScore(clickResponse.score);
                return;
            }
        }
    },

    timeSinceStart: function() {
        var currentTime = new Date().getTime();
        var timeSinceStart = (currentTime - this.startTime) / 1000;
        return timeSinceStart;
    },

	draw: function() {
		this.parent();
        this.drawScore();
        this.drawLevelBar();
	},

    drawScore: function() {
        var x = ig.system.width / 2;
        var y = 35;
        this.font.draw(this.score, x, y, ig.Font.ALIGN.CENTER);
    },

    drawLevelBar: function() {
        var scale = ig.system.scale;
        var startX = ig.system.width / 4 * scale;
        var startY = 9 * scale;
        var width = ig.system.width / 2 * scale;
        var height = 24 * scale;
        var borderWidth = 3;

        ig.system.context.fillStyle = "#ffffff";
        ig.system.context.fillRect(startX,startY,width,height);

        ig.system.context.fillStyle = "#4c618c";
        var rectStartX = startX + borderWidth + this.getProgressBarWidth();
        var rectStartY = startY + borderWidth;
        var rectWidth = width - borderWidth - borderWidth - this.getProgressBarWidth();
        var rectHeight= height - borderWidth - borderWidth;
        rectWidth = (rectWidth >= 0)?rectWidth:0;
        ig.system.context.fillRect(rectStartX,rectStartY,rectWidth,rectHeight);

        var x = ig.system.width / 2;
        var y = 9;
        var message = "LEVEL " + this.level;
        this.font.draw(message,x,y,ig.Font.ALIGN.CENTER);
    },

    getProgressBarWidth: function() {
        var rawWidth = this.progressBarScore;
        var widthCorrectedForScore = rawWidth-this.sumOfPreviousIntegers(this.level)*1000;
        var width = widthCorrectedForScore*ig.system.width/2/(this.level * 1000)*ig.system.scale;
        return width;
    },

    addScore: function(score) {
        this.score += score;
        this.updateProgressBarScore();
        if (this.progressBarScore > this.level*1000+this.sumOfPreviousIntegers(this.level)*1000) {
            this.level++;
        }
    },

    updateProgressBarScore: function() {
        if (this.progressBarScore < this.score) {
            this.progressBarScore += (this.score-this.progressBarScore)/4;
        }
        if (this.progressBarScore > this.score) {
            this.progressBarScore = this.score;
        }
    },

    sumOfPreviousIntegers: function(i) {
        var sum = ((i*(i-1))/2);
        return sum;
    },

    loseLife: function() {
        var hearts = this.getEntitiesByType( EntityHeart );
        hearts[hearts.length-1].kill();
    },

    checkDeath: function() {
        var hearts = this.getEntitiesByType( EntityHeart );
        if (hearts.length == 0) {
            ig.game.draw();
            ig.game.update = function() {};
            ig.game.draw = function() {};
            this.gameOver = true;
            this.font.draw("Swipe Up to Play Again!", ig.system.width / 2, ig.system.height / 2, ig.Font.ALIGN.CENTER);
        }
    },

    restart: function() {
        ig.system.setGame(MyGame);
    },

    trackSwipeEvents: function() {
        var game = this;
        document.getElementById('canvas').addEventListener('touchstart',function(touchEvent) {
            game.touchStart(touchEvent);
        });
        document.getElementById('canvas').addEventListener('touchend',function(touchEvent) {
            game.touchEnd(touchEvent);
        });
    },

    touchStart: function(touchEvent) {
        this.firstTouchY = touchEvent.touches[0].clientY;
    },

    touchEnd: function(touchEvent) {
        var firstTouchY = this.firstTouchY;
        var lastTouchY = touchEvent.changedTouches[0].clientY;
        if (firstTouchY - lastTouchY > 200) {
            this.swipeUp();
        }
    },

    swipeUp: function() {
        if (this.gameOver) {
            this.restart();
        }
    }

});

var c = document.createElement('canvas');
c.id = 'canvas';
document.body.appendChild(c);

if (ig.ua.mobile) {
    if (ig.ua.iPad) {
        ig.main( '#canvas', MyGame, 60, 980, 661, 1 );
    } else {
        var height = document.documentElement.clientHeight;
        var width = document.documentElement.clientWidth;
        var scale = 320/height;
        height = height*scale;
        width = width*scale;
        ig.main( '#canvas', MyGame, 60, width, height, 1 );
    }
} else {
    ig.main( '#canvas', MyGame, 60, 640, 320, 2 );
}

});
