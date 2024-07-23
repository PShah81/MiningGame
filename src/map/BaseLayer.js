"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dynamite_1 = require("../items/Dynamite");
var GroundLayer_1 = require("./GroundLayer");
var BaseLayer = /** @class */ (function () {
    function BaseLayer(scene, layer, x, y) {
        this.layer = layer;
        this.scene = scene;
        this.layer.x = x;
        this.layer.y = y;
        this.layer.setScale(3, 3);
    }
    BaseLayer.prototype.getCenterOfObject = function (object) {
        if (object && object.body) {
            var width = object.body.width;
            var height = object.body.height;
            var x = object.body.x + Math.floor(width / 2);
            var y = object.body.y + Math.floor(height / 2);
            return [x, y];
        }
        else {
            console.error("No Sprite or Body");
            return [0, 0];
        }
    };
    BaseLayer.prototype.checkTileCollision = function (direction, object) {
        if (object && object.body) {
            var tile = void 0;
            var width = object.body.width;
            var height = object.body.height;
            var _a = this.getCenterOfObject(object), x = _a[0], y = _a[1];
            if (direction == "left") {
                tile = this.layer.getTileAtWorldXY(x - width, y);
            }
            else if (direction == "right") {
                tile = this.layer.getTileAtWorldXY(x + width, y);
            }
            else if (direction == "down") {
                tile = this.layer.getTileAtWorldXY(x, y + height);
            }
            else {
                tile = this.layer.getTileAtWorldXY(x, y - height);
            }
            return tile;
        }
        else {
            console.error("No Sprite or Body");
            return null;
        }
    };
    BaseLayer.prototype.getTileAtObject = function (object) {
        var _a = this.getCenterOfObject(object), x = _a[0], y = _a[1];
        var tile = this.layer.getTileAtWorldXY(x, y);
        return tile;
    };
    BaseLayer.prototype.handleDynamite = function () {
        var _a = this.getCenterOfObject(this.scene.player), x = _a[0], y = _a[1];
        new Dynamite_1.default(this.scene, x, y, "dynamite");
    };
    BaseLayer.prototype.removeGroundTiles = function (x, y) {
        //If still in introduction prevent block removal
        if (!this.scene.intro) {
            if (this instanceof GroundLayer_1.default) {
                this.layer.removeTileAt(x, y);
                this.scene.InvisibleLayer.removeInvisibilityTiles(x, y);
            }
            else {
                console.log("Not supposed to be called by non-ground layer");
            }
        }
    };
    return BaseLayer;
}());
exports.default = BaseLayer;
