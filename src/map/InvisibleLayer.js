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
var BaseLayer_1 = require("./BaseLayer");
var InvisibleLayer = /** @class */ (function (_super) {
    __extends(InvisibleLayer, _super);
    function InvisibleLayer(scene, layer, x, y) {
        var _this = _super.call(this, scene, layer, x, y) || this;
        _this.exploredTileSet = new Set();
        _this.generateInitialInvisibilityTiles(_this.layer.tilemap.width, _this.layer.tilemap.height);
        return _this;
    }
    InvisibleLayer.prototype.generateInitialInvisibilityTiles = function (width, height) {
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var tileIndex = 0;
                if (y == 0) {
                    tileIndex = 1;
                }
                this.layer.putTileAt(tileIndex, x, y);
            }
        }
    };
    InvisibleLayer.prototype.removeInvisibilityTiles = function (tileX, tileY) {
        var groundTile;
        var darknessTile;
        var newTileX;
        var newTileY;
        var key = "".concat(tileX.toString(), ",").concat(tileY.toString());
        this.exploredTileSet.add(key);
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                newTileX = tileX + i;
                newTileY = tileY + j;
                groundTile = this.scene.GroundLayer.layer.getTileAt(newTileX, newTileY);
                this.layer.removeTileAt(newTileX, newTileY);
                key = "".concat(newTileX.toString(), ",").concat(newTileY.toString());
                //The ground tile is missing and the tile hasn't been explored yet
                if (!groundTile && !this.exploredTileSet.has(key) && (j == 0 || i == 0) && (j != 0 || i != 0) && InvisibleLayer.checkIfTileIsValid(newTileX, newTileY, this.layer)) {
                    this.removeInvisibilityTiles(newTileX, newTileY);
                }
            }
        }
    };
    InvisibleLayer.checkIfTileIsValid = function (tileX, tileY, layer) {
        if (tileX >= 0 && tileX < layer.tilemap.width && tileY >= 0 && tileY < layer.tilemap.height) {
            return true;
        }
        return false;
    };
    return InvisibleLayer;
}(BaseLayer_1.default));
exports.default = InvisibleLayer;
