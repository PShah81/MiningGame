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
var Enemy_1 = require("./Enemy");
var SlimeStateManager_1 = require("./SlimeStateManager");
var Slime = /** @class */ (function (_super) {
    __extends(Slime, _super);
    function Slime(scene, x, y, texture, GroundLayer, player) {
        var _this = _super.call(this, scene, x, y, texture, GroundLayer) || this;
        //Adjust body and sprite to map and spritesheet
        if (_this.body) {
            _this.setSize(14, 12);
            _this.setOffset(0, 4);
            _this.setScale(1.5, 1.5);
        }
        else {
            console.log("No Body??");
        }
        _this.InvisibleLayer = scene.InvisibleLayer;
        _this.slimeStateManager = new SlimeStateManager_1.default(_this, player);
        return _this;
    }
    Slime.prototype.update = function () {
        this.slimeStateManager.update();
        var tile = this.InvisibleLayer.getTileAtObject(this);
        if (tile) {
            this.setVisible(false);
        }
        else {
            this.setVisible(true);
        }
    };
    return Slime;
}(Enemy_1.default));
exports.default = Slime;
