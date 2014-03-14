ig.module(
    'game.entities.lightBall'
)
.requires(
    'impact.entity',
    'impact.font'
)
.defines(function() {
    EntityLightBall = ig.Entity.extend({
        size: {x: 64, y:64},
        name: "LightBall",
        font: new ig.Font('media/04b03.font.png'),
        animSheet: new ig.AnimationSheet('media/img/light_ball_64.png', 64,64),

        age: 0,
        timeOfDeath:  999999999,

        activeKillScore: 100,
        changingKillScore: 50,
        inactiveKillScore: 25,
        timeoutScore: -1,

        init: function(x,y,settings) {
            this.parent(x,y,settings);
            this.addAnim('active',1,[2]);
            this.addAnim('changing',1,[1]);
            this.addAnim('inactive',1,[0]);
        },

        update: function() {
            this.parent(); 
            this.handleAging();
        },

        handleAging: function() {
            this.age++;
            if (this.age > this.timeOfDeath + 25) {
                this.kill();
            } else if (this.age > 50 && this.age < 100) {
                this.currentAnim = this.anims.changing;
            } else if (this.age > 100 && this.age < 150) {
                this.currentAnim = this.anims.inactive;
            } else if (this.age == 150) {
                this.die(this.timeoutScore);
            }
        },

        userClick: function(x,y) {
            if (x > this.pos.x && x < this.pos.x+this.size.x) {
                if (y > this.pos.y && y < this.pos.y+this.size.y) {
                    return this.clicked();
                }
            }
            return {handled: false};
        },

        clicked: function() {
            if (this.isAlive()) {
                var score = 0;
                if (this.currentAnim == this.anims.active) {
                    score = this.activeKillScore;
                } else if (this.currentAnim == this.anims.changing) {
                    score = this.changingKillScore;
                } else {
                    score = this.inactiveKillScore;
                }
                this.die(score);
                return {handled: true,score:score};
            }
            return {handled: false};
        },

        isAlive: function() {
            var living = (this.age <this.timeOfDeath);
            return living;
        },

        die: function(score) {
            var score = score;
            ig.game.addScore(score);
            this.draw = function() {
                this.font.draw(score,this.pos.x + (this.size.x/2),this.pos.y + (this.size.x/2),ig.Font.ALIGN.CENTER); 
            }
            this.timeOfDeath = this.age;
            if (score < 0) {
                ig.game.loseLife();
            }
        }

    });
});
