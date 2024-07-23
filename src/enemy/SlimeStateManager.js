"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SlimeStateClasses_1 = require("./SlimeStateClasses");
var SlimeStateManager = /** @class */ (function () {
    function SlimeStateManager(slime, player) {
        this.canAttack = true;
        this.slime = slime;
        this.player = player;
        this.states = [
            new SlimeStateClasses_1.Idle(this.player, this.slime, this),
            new SlimeStateClasses_1.Walk(this.player, this.slime, this),
            new SlimeStateClasses_1.Jump(this.player, this.slime, this),
            new SlimeStateClasses_1.Fall(this.player, this.slime, this),
            new SlimeStateClasses_1.Land(this.player, this.slime, this),
            new SlimeStateClasses_1.Death(this.player, this.slime, this)
        ];
        this.currentDirection = SlimeStateClasses_1.Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(SlimeStateClasses_1.Directions.IDLE);
    }
    SlimeStateManager.prototype.update = function () {
        if (this.slime.health <= 0) {
            this.changeState(SlimeStateClasses_1.States.DEATH, SlimeStateClasses_1.Directions.IDLE);
        }
        else {
            this.currentState.update();
        }
    };
    SlimeStateManager.prototype.changeState = function (state, direction) {
        var newState = this.states[state];
        newState.direction = direction;
        if (newState != this.currentState || direction != this.currentDirection) {
            this.currentState.exit(state);
            this.currentState = newState;
            this.currentDirection = direction;
            this.currentState.enter(direction);
        }
    };
    return SlimeStateManager;
}());
exports.default = SlimeStateManager;
