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
var Explosion_1 = require("./Explosion");
var Dynamite = /** @class */ (function (_super) {
    __extends(Dynamite, _super);
    function Dynamite(scene, x, y, texture) {
        var _this = _super.call(this, scene, x, y, texture) || this;
        //Add Explosion to Game Scene
        scene.add.existing(_this);
        scene.physics.add.existing(_this);
        _this.id = Dynamite.currentId;
        Dynamite.currentId += 1;
        scene.dynamiteColliderGroup.add(_this);
        _this.setScale(1.2, 1.2);
        _this.anims.play("dynamite", true);
        _this.on('animationcomplete-dynamite', function () {
            _this.destroy();
            new Explosion_1.default(scene, _this.x, _this.y, "explosion");
        });
        return _this;
    }
    Dynamite.currentId = 0;
    return Dynamite;
}(Phaser.Physics.Arcade.Sprite));
exports.default = Dynamite;
