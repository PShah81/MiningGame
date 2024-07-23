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
exports.Death = exports.Hurt = exports.Attack = exports.Climb = exports.Land = exports.Fall = exports.Jump = exports.Mine = exports.Run = exports.Walk = exports.Idle = exports.PlayerState = exports.GoldCost = exports.Items = exports.Directions = exports.States = void 0;
var States;
(function (States) {
    States[States["IDLE"] = 0] = "IDLE";
    States[States["WALK"] = 1] = "WALK";
    States[States["RUN"] = 2] = "RUN";
    States[States["MINE"] = 3] = "MINE";
    States[States["JUMP"] = 4] = "JUMP";
    States[States["FALL"] = 5] = "FALL";
    States[States["LAND"] = 6] = "LAND";
    States[States["CLIMB"] = 7] = "CLIMB";
    States[States["ATTACK"] = 8] = "ATTACK";
    States[States["HURT"] = 9] = "HURT";
    States[States["DEATH"] = 10] = "DEATH";
})(States || (exports.States = States = {}));
var Directions;
(function (Directions) {
    Directions[Directions["LEFT"] = 0] = "LEFT";
    Directions[Directions["RIGHT"] = 1] = "RIGHT";
    Directions[Directions["UP"] = 2] = "UP";
    Directions[Directions["DOWN"] = 3] = "DOWN";
    Directions[Directions["IDLE"] = 4] = "IDLE";
})(Directions || (exports.Directions = Directions = {}));
var Items;
(function (Items) {
    Items[Items["LADDER"] = 0] = "LADDER";
    Items[Items["TORCH"] = 1] = "TORCH";
    Items[Items["DYNAMITE"] = 2] = "DYNAMITE";
    Items[Items["POTION"] = 3] = "POTION";
})(Items || (exports.Items = Items = {}));
var GoldCost;
(function (GoldCost) {
    GoldCost[GoldCost["LADDER"] = -0.5] = "LADDER";
    GoldCost[GoldCost["TORCH"] = -1] = "TORCH";
    GoldCost[GoldCost["DYNAMITE"] = -2] = "DYNAMITE";
    GoldCost[GoldCost["POTION"] = -5] = "POTION";
})(GoldCost || (exports.GoldCost = GoldCost = {}));
var PlayerState = /** @class */ (function () {
    function PlayerState(player, PlayerStateManager, GroundLayer, ItemLayer) {
        this.player = player;
        this.PlayerStateManager = PlayerStateManager;
        this.finishedAnimation = false;
        this.GroundLayer = GroundLayer;
        this.ItemLayer = ItemLayer;
    }
    PlayerState.prototype.enter = function (direction) { };
    PlayerState.prototype.exit = function (exitState) { };
    PlayerState.prototype.update = function (cursors, lastKeyPressed) { };
    PlayerState.prototype.moveHorizontally = function (direction) {
        var velocity = this.getPlayerVelocity();
        this.player.setAccelerationX(0);
        if (direction == Directions.LEFT) {
            this.player.setFlipX(true);
            this.player.setVelocityX(Math.min(-100, velocity.x));
        }
        else {
            this.player.setFlipX(false);
            this.player.setVelocityX(Math.max(100, velocity.x));
        }
    };
    PlayerState.prototype.handleKeyPress = function (lastKeyPressed) {
        if (lastKeyPressed) {
            this.craftItem(lastKeyPressed);
            this.removeItem(lastKeyPressed);
        }
    };
    PlayerState.prototype.craftItem = function (lastKeyPressed) {
        var item = -1;
        var goldCost = 0;
        if (lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.ONE) {
            item = Items.LADDER;
            goldCost = GoldCost.LADDER;
        }
        else if (lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.TWO) {
            item = Items.TORCH;
            goldCost = GoldCost.TORCH;
        }
        else if (lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.THREE) {
            item = Items.DYNAMITE;
            goldCost = GoldCost.DYNAMITE;
        }
        else if (lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.FOUR) {
            item = Items.POTION;
            goldCost = GoldCost.POTION;
        }
        if (item != -1 && this.player.gold + goldCost >= 0) {
            if (item == Items.LADDER) {
                var placed = this.ItemLayer.placeItem(item, this.player);
                if (placed) {
                    this.player.scene.updateGold(goldCost);
                }
            }
            else if (item == Items.TORCH) {
                var placed = this.ItemLayer.placeItem(item, this.player);
                if (placed) {
                    this.player.scene.updateGold(goldCost);
                }
            }
            else if (item == Items.DYNAMITE) {
                this.GroundLayer.handleDynamite();
                this.player.scene.updateGold(goldCost);
            }
            else if (item == Items.POTION) {
                var changed = this.player.changeHealth(0.5 * this.player.maxHealth);
                if (changed) {
                    this.player.scene.updateGold(goldCost);
                }
            }
        }
    };
    PlayerState.prototype.removeItem = function (lastKeyPressed) {
        if (lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q) {
            this.ItemLayer.removeItem(this.player);
        }
    };
    PlayerState.prototype.playerOnFloor = function () {
        if (this.player.body) {
            if (this.player.body instanceof Phaser.Physics.Arcade.Body && this.player.body.onFloor()) {
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
    PlayerState.prototype.getPlayerVelocity = function () {
        if (this.player.body) {
            return this.player.body.velocity;
        }
        else {
            console.error("No Body");
            return new Phaser.Math.Vector2(0, 0);
        }
    };
    PlayerState.prototype.stopMineCheck = function (cursors, newState) {
        if (cursors.left.isDown || cursors.right.isDown || cursors.down.isDown) {
            if (newState != States.MINE) {
                this.GroundLayer.stopMining();
            }
        }
    };
    return PlayerState;
}());
exports.PlayerState = PlayerState;
var Idle = /** @class */ (function (_super) {
    __extends(Idle, _super);
    function Idle(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Idle.prototype.enter = function (direction) {
        this.player.anims.play("idle", true);
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        this.player.setAccelerationX(0);
        this.player.setAccelerationY(0);
    };
    Idle.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        this.handleKeyPress(lastKeyPressed);
        if (cursors.left.isDown) {
            this.GroundLayer.startMining("left");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if (this.playerOnFloor()) {
                newState = States.WALK;
                newDirection = Directions.LEFT;
            }
        }
        if (cursors.right.isDown) {
            this.GroundLayer.startMining("right");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if (this.playerOnFloor()) {
                newState = States.WALK;
                newDirection = Directions.RIGHT;
            }
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if (this.playerOnFloor()) {
                newState = States.JUMP;
            }
        }
        if (cursors.down.isDown) {
            this.GroundLayer.startMining("down");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors, newState);
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    return Idle;
}(PlayerState));
exports.Idle = Idle;
var Walk = /** @class */ (function (_super) {
    __extends(Walk, _super);
    function Walk(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Walk.prototype.enter = function (direction) {
        this.direction = direction;
        if (direction == Directions.LEFT) {
            this.moveHorizontally(direction);
            this.player.setAccelerationX(-50);
        }
        else {
            this.moveHorizontally(direction);
            this.player.setAccelerationX(50);
        }
        this.player.anims.play("walk", true);
    };
    Walk.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        var velocity = this.getPlayerVelocity();
        this.handleKeyPress(lastKeyPressed);
        if (cursors.left.isDown) {
            this.GroundLayer.startMining("left");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x < -200) {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        if (cursors.right.isDown) {
            this.GroundLayer.startMining("right");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x > 200) {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if (this.playerOnFloor()) {
                newState = States.JUMP;
            }
        }
        if (cursors.down.isDown) {
            this.GroundLayer.startMining("down");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors, newState);
        if (newState == States.IDLE) {
            if (!this.playerOnFloor()) {
                newState = States.FALL;
            }
            else {
                newState = States.IDLE;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    return Walk;
}(PlayerState));
exports.Walk = Walk;
var Run = /** @class */ (function (_super) {
    __extends(Run, _super);
    function Run(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Run.prototype.enter = function (direction) {
        this.direction = direction;
        if (direction == Directions.LEFT) {
            this.player.setAccelerationX(-75);
        }
        else {
            this.player.setAccelerationX(75);
        }
        this.player.anims.play("run", true);
    };
    Run.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        var velocity = this.getPlayerVelocity();
        this.handleKeyPress(lastKeyPressed);
        if (cursors.left.isDown) {
            this.GroundLayer.startMining("left");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x < -200) {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        if (cursors.right.isDown) {
            this.GroundLayer.startMining("right");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x > 200) {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if (this.playerOnFloor()) {
                newState = States.JUMP;
            }
        }
        if (cursors.down.isDown) {
            this.GroundLayer.startMining("down");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors, newState);
        if (newState == States.IDLE) {
            if (!this.playerOnFloor()) {
                newState = States.FALL;
            }
            else {
                newState = States.IDLE;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    return Run;
}(PlayerState));
exports.Run = Run;
var Mine = /** @class */ (function (_super) {
    __extends(Mine, _super);
    function Mine(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Mine.prototype.enter = function (direction) {
        this.direction = direction;
        if (direction == Directions.LEFT) {
            this.moveHorizontally(direction);
        }
        else if (direction == Directions.RIGHT) {
            this.moveHorizontally(direction);
        }
        else {
            this.player.setVelocityX(0);
            this.player.setAccelerationX(0);
        }
        this.player.anims.play("mine", true);
    };
    Mine.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        // If we've changed our mining direction or we're mining a different tile than the one we initially were, stop mining
        if (this.GroundLayer.currentMiningDirection && this.GroundLayer.miningTile) {
            var tile = this.GroundLayer.checkTileCollision(this.GroundLayer.currentMiningDirection, this.player);
            if (!tile || (tile && (tile.x != this.GroundLayer.miningTile.x || tile.y != this.GroundLayer.miningTile.y))) {
                this.GroundLayer.stopMining();
            }
        }
        if (cursors.left.isDown) {
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if (this.playerOnFloor()) {
                newState = States.WALK;
                newDirection = Directions.LEFT;
            }
        }
        if (cursors.right.isDown) {
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if (this.playerOnFloor()) {
                newState = States.WALK;
                newDirection = Directions.RIGHT;
            }
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if (this.playerOnFloor()) {
                newState = States.JUMP;
            }
        }
        if (cursors.down.isDown) {
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors, newState);
        if (newState == States.IDLE) {
            if (!this.playerOnFloor()) {
                newState = States.FALL;
            }
            else {
                newState = States.IDLE;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    Mine.prototype.exit = function () {
        this.GroundLayer.stopMining();
    };
    return Mine;
}(PlayerState));
exports.Mine = Mine;
var Jump = /** @class */ (function (_super) {
    __extends(Jump, _super);
    function Jump(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Jump.prototype.enter = function (direction) {
        var _this = this;
        this.player.setVelocityY(-250);
        this.finishedAnimation = false;
        this.player.anims.play("jump", true).on('animationcomplete-jump', function () { _this.finishedAnimation = true; }, this);
    };
    Jump.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        this.handleKeyPress(lastKeyPressed);
        if (this.finishedAnimation) {
            if (cursors.left.isDown) {
                this.GroundLayer.startMining("left");
                this.moveHorizontally(Directions.LEFT);
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
            }
            else if (cursors.right.isDown) {
                this.GroundLayer.startMining("right");
                this.moveHorizontally(Directions.RIGHT);
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
            }
            else {
                //If not left or right
                this.player.setAccelerationX(0);
                this.player.setVelocityX(0);
            }
            if (cursors.space.isDown) {
                newState = States.ATTACK;
            }
            if (cursors.up.isDown) {
                if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
            }
            if (cursors.down.isDown) {
                if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
            this.stopMineCheck(cursors, newState);
            if (newState == States.IDLE) {
                if (!this.playerOnFloor()) {
                    newState = States.FALL;
                }
                else {
                    newState = States.LAND;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    };
    return Jump;
}(PlayerState));
exports.Jump = Jump;
var Fall = /** @class */ (function (_super) {
    __extends(Fall, _super);
    function Fall(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Fall.prototype.enter = function (direction) {
        this.player.setAccelerationX(0);
        this.player.anims.play("fall", true);
    };
    Fall.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        this.handleKeyPress(lastKeyPressed);
        if (cursors.left.isDown) {
            this.GroundLayer.startMining("left");
            this.moveHorizontally(Directions.LEFT);
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
        }
        else if (cursors.right.isDown) {
            this.GroundLayer.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
        }
        else {
            //If not left or right
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
        }
        if (cursors.down.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        if (this.playerOnFloor()) {
            newState = States.LAND;
        }
        this.stopMineCheck(cursors, newState);
        if (newState == States.IDLE) {
            if (!this.playerOnFloor()) {
                newState = States.FALL;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    return Fall;
}(PlayerState));
exports.Fall = Fall;
var Land = /** @class */ (function (_super) {
    __extends(Land, _super);
    function Land(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Land.prototype.enter = function (direction) {
        var _this = this;
        this.finishedAnimation = false;
        this.player.anims.play("land", true).on('animationcomplete-land', function () { _this.finishedAnimation = true; }, this);
    };
    Land.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        this.handleKeyPress(lastKeyPressed);
        if (this.finishedAnimation) {
            if (cursors.left.isDown) {
                this.GroundLayer.startMining("left");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
            if (cursors.right.isDown) {
                this.GroundLayer.startMining("right");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
            if (cursors.space.isDown) {
                newState = States.ATTACK;
            }
            if (cursors.up.isDown) {
                if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
                else if (this.playerOnFloor()) {
                    newState = States.JUMP;
                }
            }
            if (cursors.down.isDown) {
                this.GroundLayer.startMining("down");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
            this.stopMineCheck(cursors, newState);
            if (newState == States.IDLE) {
                if (!this.playerOnFloor()) {
                    newState = States.FALL;
                }
                else {
                    newState = States.IDLE;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    };
    return Land;
}(PlayerState));
exports.Land = Land;
var Climb = /** @class */ (function (_super) {
    __extends(Climb, _super);
    function Climb(player, PlayerStateManager, GroundLayer, ItemLayer) {
        var _this = _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
        _this.currentFrame = null;
        return _this;
    }
    Climb.prototype.enter = function (direction) {
        this.direction = direction;
        if (this.player.body && this.player.body instanceof Phaser.Physics.Arcade.Body) {
            this.player.body.setAllowGravity(false);
        }
        if (direction == Directions.UP) {
            if (this.currentFrame) {
                this.player.anims.play({ key: "climbUp", startFrame: this.currentFrame }, true);
            }
            else {
                this.player.anims.play("climbUp", true);
            }
            this.player.setVelocityY(-150);
        }
        else if (direction == Directions.DOWN) {
            if (this.currentFrame) {
                this.player.anims.play({ key: "climbDown", startFrame: this.currentFrame }, true);
            }
            else {
                this.player.anims.play("climbDown", true);
            }
            this.player.setVelocityY(150);
        }
        else {
            if (this.player.anims.currentAnim && this.player.anims.currentFrame && ["climbUp", "climbDown"].includes(this.player.anims.currentAnim.key)) {
                this.currentFrame = this.player.anims.currentFrame.index - 1;
                this.player.anims.pause();
            }
            else {
                this.player.anims.play("climbIdle");
            }
            this.player.setVelocityY(0);
        }
    };
    Climb.prototype.update = function (cursors, lastKeyPressed) {
        var velocity = this.getPlayerVelocity();
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        this.handleKeyPress(lastKeyPressed);
        if (cursors.left.isDown) {
            this.moveHorizontally(Directions.LEFT);
            this.GroundLayer.startMining("left");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x < -200) {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        else if (cursors.right.isDown) {
            this.moveHorizontally(Directions.RIGHT);
            this.GroundLayer.startMining("right");
            if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if (this.playerOnFloor()) {
                if (velocity.x > 200) {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }
        else {
            //If not left or right are down
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }
        if (cursors.space.isDown) {
            newState = States.ATTACK;
        }
        if (cursors.up.isDown) {
            if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if (this.playerOnFloor()) {
                newState = States.JUMP;
            }
        }
        if (cursors.down.isDown) {
            if (this.playerOnFloor()) {
                this.GroundLayer.startMining("down");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down") {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
            }
            else if (this.player.canClimb) {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors, newState);
        if (newState == States.IDLE) {
            if (this.player.canClimb && !this.playerOnFloor()) {
                newState = States.CLIMB;
                newDirection = Directions.IDLE;
            }
            else if (this.playerOnFloor()) {
                newState = States.IDLE;
            }
            else {
                newState = States.FALL;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    };
    Climb.prototype.exit = function (exitState) {
        if (exitState != States.CLIMB) {
            if (this.player.body && this.player.body instanceof Phaser.Physics.Arcade.Body) {
                this.player.body.setAllowGravity(true);
            }
        }
    };
    return Climb;
}(PlayerState));
exports.Climb = Climb;
var Attack = /** @class */ (function (_super) {
    __extends(Attack, _super);
    function Attack(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Attack.prototype.enter = function (direction) {
        var _this = this;
        this.finishedAnimation = false;
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.attackHitBox.body.enable = true;
        this.player.anims.play("attack", true).on('animationcomplete-attack', function () { _this.finishedAnimation = true; }, this);
    };
    Attack.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        if (this.finishedAnimation) {
            if (cursors.left.isDown) {
                this.GroundLayer.startMining("left");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
            else if (cursors.right.isDown) {
                this.GroundLayer.startMining("right");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
            if (cursors.up.isDown) {
                if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
                else if (this.playerOnFloor()) {
                    newState = States.JUMP;
                }
            }
            if (cursors.down.isDown) {
                this.GroundLayer.startMining("down");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
            this.stopMineCheck(cursors, newState);
            if (newState == States.IDLE) {
                if (!this.playerOnFloor()) {
                    newState = States.FALL;
                }
                else {
                    newState = States.IDLE;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    };
    Attack.prototype.exit = function (exitState) {
        this.player.attackHitBox.body.enable = false;
        this.player.enemiesHit.clear();
    };
    return Attack;
}(PlayerState));
exports.Attack = Attack;
var Hurt = /** @class */ (function (_super) {
    __extends(Hurt, _super);
    function Hurt(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Hurt.prototype.enter = function (direction) {
        this.finishedAnimation = false;
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.anims.play("hurt", true).on('animationcomplete-hurt', this.handleHurtEnd, this);
    };
    Hurt.prototype.update = function (cursors, lastKeyPressed) {
        var newState = States.IDLE;
        var newDirection = Directions.IDLE;
        if (this.finishedAnimation) {
            if (cursors.left.isDown) {
                this.GroundLayer.startMining("left");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left") {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
            else if (cursors.right.isDown) {
                this.GroundLayer.startMining("right");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right") {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
                else if (this.playerOnFloor()) {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
            if (cursors.space.isDown) {
                newState = States.ATTACK;
            }
            if (cursors.up.isDown) {
                if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
                else if (this.playerOnFloor()) {
                    newState = States.JUMP;
                }
            }
            if (cursors.down.isDown) {
                this.GroundLayer.startMining("down");
                if (this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor()) {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if (this.player.canClimb) {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
            this.stopMineCheck(cursors, newState);
            if (newState == States.IDLE) {
                if (!this.playerOnFloor()) {
                    newState = States.FALL;
                }
                else {
                    newState = States.IDLE;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    };
    Hurt.prototype.handleHurtEnd = function () {
        if (this.player.health <= 0) {
            this.PlayerStateManager.changeState(States.DEATH, Directions.IDLE);
        }
        else {
            this.finishedAnimation = true;
        }
    };
    return Hurt;
}(PlayerState));
exports.Hurt = Hurt;
var Death = /** @class */ (function (_super) {
    __extends(Death, _super);
    function Death(player, PlayerStateManager, GroundLayer, ItemLayer) {
        return _super.call(this, player, PlayerStateManager, GroundLayer, ItemLayer) || this;
    }
    Death.prototype.enter = function (direction) {
        var _this = this;
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.anims.play("death", true).on('animationcomplete-death', function () { _this.player.destroy(); }, this);
    };
    return Death;
}(PlayerState));
exports.Death = Death;
