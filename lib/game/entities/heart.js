ig.module(
    'game.entities.heart'
)
.requires(
    'impact.entity',
    'impact.font'
)
.defines(function() {
    EntityHeart = ig.Entity.extend({
        name: "Heart",
        
        animSheet: new ig.AnimationSheet('media/img/heart_24.png', 24, 24),

        init: function(x, y, settings) {
            this.addAnim('default', 100, [0]);
            this.parent(x, y, settings);
        }

    });
});
