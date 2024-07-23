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
var Enemy_1 = require("../enemy/Enemy");
var PlayerStateClasses_1 = require("./PlayerStateClasses");
var PlayerStateManager_1 = require("./PlayerStateManager");
var Explosion_1 = require("../items/Explosion");
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(scene, x, y, texture, GroundLayer, ItemLayer) {
        var _this = _super.call(this, scene, x, y, texture) || this;
        _this.handleEnemyDamage = function (hitbox, enemy) {
            if (enemy instanceof Enemy_1.default) {
                if (!_this.enemiesHit.has(enemy.id)) {
                    enemy.handleDamage(5);
                    var knockbackDirection = new Phaser.Math.Vector2(enemy.x - _this.x, enemy.y - _this.y).normalize();
                    // Apply knockback to the enemy
                    var knockbackForce = 50;
                    var friction = 30;
                    enemy.setVelocity(knockbackDirection.x * knockbackForce, knockbackDirection.y * knockbackForce);
                    enemy.setAccelerationX(-knockbackDirection.x * friction);
                }
                _this.enemiesHit.add(enemy.id);
            }
            else {
                console.error("Not of type Enemy");
            }
        };
        _this.handlePlayerDamage = function (player, assailant) {
            if (assailant instanceof Enemy_1.default) {
                if (_this.canBeHit) {
                    _this.takeDamage(assailant.attack);
                    _this.canBeHit = false;
                    _this.scene.time.addEvent({
                        callback: function () {
                            _this.canBeHit = true;
                        },
                        callbackScope: _this,
                        delay: 1000
                    });
                }
            }
            else if (assailant instanceof Explosion_1.default) {
                if (!_this.explosions.has(assailant.id)) {
                    _this.takeDamage(assailant.attack);
                }
                _this.explosions.add(assailant.id);
            }
            else {
                console.error("Not of type Enemy");
            }
        };
        _this.takeDamage = function (damage) {
            _this.changeHealth(-1 * damage);
            _this.playerStateManager.changeState(PlayerStateClasses_1.States.HURT, PlayerStateClasses_1.Directions.IDLE);
        };
        _this.scene = scene;
        _this.setPipeline("Light2D");
        //Add Player to Game Scene
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        //Misc
        _this.setMaxVelocity(250);
        _this.playerStateManager = new PlayerStateManager_1.default(_this, GroundLayer, ItemLayer);
        _this.maxHealth = 40;
        _this.health = _this.maxHealth;
        _this.canBeHit = true;
        _this.enemiesHit = new Set();
        _this.explosions = new Set();
        _this.gold = 20;
        //Collision Logic
        scene.physics.add.collider(_this, GroundLayer.layer);
        _this.canClimb = false;
        scene.physics.add.overlap(_this, ItemLayer.layer, ItemLayer.canClimb, undefined, _this);
        _this.setCollideWorldBounds(true);
        scene.physics.add.collider(_this, scene.enemyGroup, _this.handlePlayerDamage, undefined, _this);
        _this.setPushable(false);
        //Adjust body to map and spritesheet
        if (_this.body) {
            _this.setScale(1.3, 1.3);
            _this.body.setSize(26, 36);
            _this.body.setOffset(12, 12);
        }
        else {
            console.error("No Body");
        }
        //Attack Logic
        _this.attackHitBox = scene.add.rectangle(_this.x, _this.y, 16, 16, 0xffffff, 0);
        _this.attackHitBox.setScale(1.3, 1.3);
        scene.physics.add.existing(_this.attackHitBox);
        _this.attackHitBox.body.setAllowGravity(false);
        _this.attackHitBox.body.enable = false;
        scene.physics.add.overlap(_this.attackHitBox, scene.enemyGroup, _this.handleEnemyDamage, undefined, _this);
        // #region Health Bar   
        var borderWidth = 2;
        _this.maxHealthWidth = 200;
        var height = 20;
        var xPos = 120;
        var yPos = 25;
        var borderX = xPos - (_this.maxHealthWidth + borderWidth) / 2;
        var borderY = yPos - (height + borderWidth) / 2;
        var healthBarBorder = scene.add.graphics();
        healthBarBorder.lineStyle(borderWidth, 0xffffff, 1);
        healthBarBorder.strokeRect(borderX, borderY, _this.maxHealthWidth + borderWidth, height + borderWidth);
        _this.playerHealth = scene.add.rectangle(xPos, yPos, _this.maxHealthWidth, height, 0xff0000);
        //Keep it in the same position relative to the viewport
        healthBarBorder.scrollFactorX = 0;
        healthBarBorder.scrollFactorY = 0;
        _this.playerHealth.scrollFactorX = 0;
        _this.playerHealth.scrollFactorY = 0;
        return _this;
        // #endregion Health Bar
    }
    Player.prototype.update = function (cursors, lastKeyPressed) {
        this.playerStateManager.update(cursors, lastKeyPressed);
    };
    Player.prototype.changeHealth = function (change) {
        //If in intro do not allow damage to be taken
        if (!this.scene.intro) {
            var newHealth = this.health + change;
            if (newHealth < 0) {
                newHealth = 0;
            }
            else if (newHealth > this.maxHealth) {
                newHealth = this.maxHealth;
            }
            //Return false if no healing happened;
            if (change > 0 && newHealth == this.health) {
                return false;
            }
            //Change health and health bar
            this.health = newHealth;
            this.playerHealth.width = Math.max(this.maxHealthWidth * this.health / this.maxHealth, 0);
            return true;
        }
    };
    return Player;
}(Phaser.Physics.Arcade.Sprite));
exports.default = Player;
