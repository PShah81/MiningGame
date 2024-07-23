"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlayerStateClasses_1 = require("./PlayerStateClasses");
var PlayerStateManager = /** @class */ (function () {
    function PlayerStateManager(player, GroundLayer, ItemLayer) {
        var _this = this;
        this.updateHitboxPosition = function () {
            if (_this.player.body) {
                var centerVec = _this.player.body.center;
                _this.player.attackHitBox.x = _this.player.flipX
                    ? centerVec.x - _this.player.body.width * 0.9
                    : centerVec.x + _this.player.body.width * 0.9;
                _this.player.attackHitBox.y = centerVec.y;
            }
        };
        this.GroundLayer = GroundLayer;
        this.ItemLayer = ItemLayer;
        this.player = player;
        this.states = [
            new PlayerStateClasses_1.Idle(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Walk(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Run(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Mine(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Jump(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Fall(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Land(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Climb(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Attack(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Hurt(this.player, this, this.GroundLayer, this.ItemLayer),
            new PlayerStateClasses_1.Death(this.player, this, this.GroundLayer, this.ItemLayer)
        ];
        this.currentDirection = PlayerStateClasses_1.Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(PlayerStateClasses_1.Directions.IDLE);
    }
    PlayerStateManager.prototype.update = function (cursors, lastKeyPressed) {
        this.currentState.update(cursors, lastKeyPressed);
        this.updateHitboxPosition();
    };
    PlayerStateManager.prototype.changeState = function (state, direction) {
        this.updateHitboxPosition();
        //If no longer overlapping with ladder set can climb to false
        if (!this.player.scene.physics.world.overlap(this.player, this.ItemLayer.layer, this.ItemLayer.canClimb)) {
            this.player.canClimb = false;
        }
        var newState = this.states[state];
        newState.direction = direction;
        // As long as something is different allow state change
        if (newState != this.currentState || direction != this.currentDirection) {
            // If in death state nothing can be changed
            if (this.currentState != this.states[PlayerStateClasses_1.States.DEATH]) {
                this.currentState.exit(state);
                this.currentState = newState;
                this.currentDirection = direction;
                this.currentState.enter(direction);
            }
        }
    };
    return PlayerStateManager;
}());
exports.default = PlayerStateManager;
