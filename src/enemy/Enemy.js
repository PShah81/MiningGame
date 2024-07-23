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
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(scene, x, y, texture, GroundLayer) {
        var _this = _super.call(this, scene, x, y, texture) || this;
        _this.setPipeline("Light2D");
        _this.health = 10;
        _this.attack = 5;
        _this.id = Enemy.currentId;
        Enemy.currentId += 1;
        //Add Enemy to Game Scene
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        //Collision Logic
        scene.physics.add.collider(_this, GroundLayer.layer);
        _this.setPushable(false);
        scene.enemyGroup.add(_this);
        return _this;
    }
    Enemy.prototype.update = function () {
    };
    Enemy.prototype.handleDamage = function (damage) {
        this.health -= damage;
        console.log(this.health);
    };
    Enemy.currentId = 0;
    return Enemy;
}(Phaser.Physics.Arcade.Sprite));
exports.default = Enemy;
