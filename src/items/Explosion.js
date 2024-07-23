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
var Explosion = /** @class */ (function (_super) {
    __extends(Explosion, _super);
    function Explosion(scene, x, y, texture) {
        var _this = _super.call(this, scene, x, y, texture) || this;
        _this.enemiesHit = new Set();
        //Add Explosion to Game Scene
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        //Deals damage to everything
        _this.attack = 10;
        _this.id = Explosion.currentId;
        Explosion.currentId += 1;
        scene.explosionOverlapGroup.add(_this);
        if (_this.body && _this.body instanceof Phaser.Physics.Arcade.Body) {
            _this.body.setAllowGravity(false);
            _this.body.setVelocityY(0);
        }
        else {
            console.error("Explosion has no body");
        }
        _this.setScale(3.5, 3.5);
        _this.anims.play("explosion", true);
        _this.on('animationcomplete-explosion', function () {
            _this.destroy();
        });
        return _this;
    }
    Explosion.prototype.handleDamage = function (enemy, explosion) {
        if (enemy instanceof Enemy_1.default) {
            if (!this.enemiesHit.has(enemy.id)) {
                enemy.handleDamage(10);
                var knockbackDirection = new Phaser.Math.Vector2(enemy.x - this.x, enemy.y - this.y).normalize();
                // Apply knockback to the enemy
                var knockbackForce = 100;
                var friction = 30;
                enemy.setVelocity(knockbackDirection.x * knockbackForce, knockbackDirection.y * knockbackForce);
                enemy.setAccelerationX(-knockbackDirection.x * friction);
            }
            this.enemiesHit.add(enemy.id);
        }
        else {
            console.error("Not of type Enemy");
        }
    };
    Explosion.currentId = 0;
    return Explosion;
}(Phaser.Physics.Arcade.Sprite));
exports.default = Explosion;
