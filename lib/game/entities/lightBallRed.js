ig.module(
    'game.entities.lightBallRed'
)
.requires(
    'impact.entity',
    'impact.font',

    'game.entities.lightBall'
)
.defines(function() {
    EntityLightBallRed = EntityLightBall.extend({
        name: "LightBallRed",
        font: new ig.Font('media/04b03.font.png'),
        
        animSheet: new ig.AnimationSheet('media/img/light_ball_red_64.png', 64, 64),

        activeKillScore: -1,
        changingKillScore: -1,
        inactiveKillScore: -1,

        timeoutScore: 25
    });
});
