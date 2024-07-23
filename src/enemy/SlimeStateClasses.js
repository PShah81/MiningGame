"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Death = exports.Land = exports.Fall = exports.Jump = exports.Walk = exports.Idle = exports.SlimeState = exports.Directions = exports.States = void 0;
var States;
(function (States) {
    States[States["IDLE"] = 0] = "IDLE";
    States[States["WALK"] = 1] = "WALK";
    States[States["JUMP"] = 2] = "JUMP";
    States[States["FALL"] = 3] = "FALL";
    States[States["LAND"] = 4] = "LAND";
    States[States["DEATH"] = 5] = "DEATH";
})(States || (exports.States = States = {}));
var Directions;
(function (Directions) {
    Directions[Directions["LEFT"] = 0] = "LEFT";
    Directions[Directions["RIGHT"] = 1] = "RIGHT";
    Directions[Directions["IDLE"] = 2] = "IDLE";
})(Directions || (exports.Directions = Directions = {}));
var SlimeState = /** @class */ (function () {
    function SlimeState(player, slime, SlimeStateManager) {
        this.player = player;
        this.slime = slime;
        this.SlimeStateManager = SlimeStateManager;
    }
    SlimeState.prototype.enter = function (direction) { };
    SlimeState.prototype.update = function () { };
    SlimeState.prototype.exit = function (exitState) { };
    SlimeState.prototype.findFollowDirection = function () {
        if (this.player.body && this.slime.body) {
            var playerPos = this.player.body.center;
            var slimePos = this.slime.body.center;
            var distancePlayerAndSlime = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, slimePos.x, slimePos.y);
            if (distancePlayerAndSlime < 200) {
                var direction = Directions.IDLE;
                var xDifference = playerPos.x - slimePos.x;
                //Use threshold to allow slime to settle into idle state
                var threshold = 1;
                if (xDifference < threshold * -1) {
                    direction = Directions.LEFT;
                }
                else if (xDifference > threshold) {
                    direction = Directions.RIGHT;
                }
                return direction;
            }
            else {
                return Directions.IDLE;
            }
        }
        else {
            console.error("No player or slime body");
            return Directions.IDLE;
        }
    };
    SlimeState.prototype.slimeOnFloor = function () {
        if (this.slime.body) {
            if (this.slime.body instanceof Phaser.Physics.Arcade.Body && this.slime.body.onFloor()) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            console.error("No Body");
            return false;
        }
    };
    SlimeState.prototype.moveHorizontally = function (direction) {
        this.slime.setAccelerationX(0);
        if (direction == Directions.RIGHT) {
            this.slime.setFlipX(true);
            this.slime.setVelocityX(30);
        }
        else if (direction == Directions.LEFT) {
            this.slime.setFlipX(false);
            this.slime.setVelocityX(-30);
        }
        else {
            this.slime.setVelocityX(0);
        }
    };
    return SlimeState;
}());
exports.SlimeState = SlimeState;
var Idle = /** @class */ (function (_super) {
    __extends(Idle, _super);
    function Idle(player, slime, SlimeStateManager) {
        return _super.call(this, player, slime, SlimeStateManager) || this;
    }
    Idle.prototype.enter = function (direction) {
        this.slime.setVelocityX(0);
        this.slime.anims.play("slime_idle", true);
    };
    Idle.prototype.update = function () {
        var state = States.IDLE;
        var direction = this.findFollowDirection();
        if (direction != Directions.IDLE) {
            state = States.WALK;
        }
        this.SlimeStateManager.changeState(state, direction);
    };
    return Idle;
}(SlimeState));
exports.Idle = Idle;
var Walk = /** @class */ (function (_super) {
    __extends(Walk, _super);
    function Walk(player, slime, SlimeStateManager) {
        return _super.call(this, player, slime, SlimeStateManager) || this;
    }
    Walk.prototype.enter = function (direction) {
        this.moveHorizontally(direction);
        this.slime.anims.play("slime_walk", true);
    };
    Walk.prototype.update = function () {
        var state = States.IDLE;
        var direction = this.findFollowDirection();
        if (direction != Directions.IDLE) {
            if (Math.random() * 10 < 0.1 && this.slimeOnFloor()) {
                state = States.JUMP;
            }
            else {
                state = States.WALK;
            }
        }
        this.SlimeStateManager.changeState(state, direction);
    };
    return Walk;
}(SlimeState));
exports.Walk = Walk;
var Jump = /** @class */ (function (_super) {
    __extends(Jump, _super);
    function Jump(player, slime, SlimeStateManager) {
        return _super.call(this, player, slime, SlimeStateManager) || this;
    }
    Jump.prototype.enter = function (direction) {
        this.moveHorizontally(direction);
        this.slime.setVelocityY(-200);
        this.slime.anims.play("slime_jump", true);
    };
    Jump.prototype.update = function () {
        var state = States.JUMP;
        var direction = this.findFollowDirection();
        this.moveHorizontally(direction);
        if (this.slime.body && this.slime.body.velocity.y > -20) {
            state = States.FALL;
        }
        //Don't want to recall jump and call enter method again
        if (state != States.JUMP) {
            this.SlimeStateManager.changeState(state, direction);
        }
    };
    return Jump;
}(SlimeState));
exports.Jump = Jump;
var Fall = /** @class */ (function (_super) {
    __extends(Fall, _super);
    function Fall(player, slime, SlimeStateManager) {
        return _super.call(this, player, slime, SlimeStateManager) || this;
    }
    Fall.prototype.enter = function (direction) {
        this.moveHorizontally(direction);
        this.slime.anims.play("slime_fall", true);
    };
    Fall.prototype.update = function () {
        var state = States.FALL;
        var direction = this.findFollowDirection();
        this.moveHorizontally(direction);
        //In this one case landing gets more priority
        if (this.slimeOnFloor()) {
            state = States.LAND;
        }
        //Don't want to recall fall and call enter method again
        if (state != States.FALL) {
            this.SlimeStateManager.changeState(state, direction);
        }
    };
    return Fall;
}(SlimeState));
exports.Fall = Fall;
var Land = /** @class */ (function (_super) {
    __extends(Land, _super);
    function Land(player, slime, SlimeStateManager) {
        var _this = _super.call(this, player, slime, SlimeStateManager) || this;
        _this.finishedAnimation = false;
        return _this;
    }
    Land.prototype.enter = function (direction) {
        var _this = this;
        this.moveHorizontally(direction);
        this.slime.anims.play("slime_land", true).on('animationcomplete-slime_land', function () { _this.finishedAnimation = true; }, this);
    };
    Land.prototype.update = function () {
        if (this.finishedAnimation) {
            var state = States.IDLE;
            var direction = this.findFollowDirection();
            if (direction != Directions.IDLE) {
                state = States.WALK;
            }
            this.SlimeStateManager.changeState(state, direction);
        }
    };
    return Land;
}(SlimeState));
exports.Land = Land;
var Death = /** @class */ (function (_super) {
    __extends(Death, _super);
    function Death(player, slime, SlimeStateManager) {
        return _super.call(this, player, slime, SlimeStateManager) || this;
    }
    Death.prototype.enter = function (direction) {
        var _this = this;
        this.slime.anims.play("slime_death", true).on('animationcomplete-slime_death', function () { _this.slime.destroy(); }, this);
    };
    return Death;
}(SlimeState));
exports.Death = Death;
