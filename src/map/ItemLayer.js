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
var PlayerStateClasses_1 = require("../player/PlayerStateClasses");
var Player_1 = require("../player/Player");
var ItemLayer = /** @class */ (function (_super) {
    __extends(ItemLayer, _super);
    function ItemLayer(scene, layer, x, y) {
        var _this = _super.call(this, scene, layer, x, y) || this;
        _this.itemsExploded = function (explosion, itemsTile) {
            if (itemsTile instanceof Phaser.Tilemaps.Tile) {
                _this.removeLightsAndTile(itemsTile);
            }
            else {
                console.error("Got game object instead of tile");
            }
        };
        _this.canClimb = function (player, tile) {
            if (tile instanceof Phaser.Tilemaps.Tile) {
                var vec = _this.layer.tileToWorldXY(tile.x, tile.y);
                var width = _this.layer.tileToWorldX(1) - _this.layer.tileToWorldX(0);
                var height = _this.layer.tileToWorldY(1) - _this.layer.tileToWorldY(0);
                var left = vec.x;
                var right = vec.x + width;
                var top_1 = vec.y;
                var bottom = top_1 + height;
                if (tile.index == PlayerStateClasses_1.Items.LADDER &&
                    player &&
                    player instanceof Player_1.default &&
                    player.body &&
                    player.body.left >= left &&
                    player.body.right <= right &&
                    player.body.bottom - Math.floor(player.body.height / 4) > top_1 &&
                    player.body.top + Math.floor(player.body.height / 4) < bottom) {
                    player.canClimb = true;
                }
                else if (player instanceof Player_1.default) {
                    player.canClimb = false;
                }
            }
        };
        _this.layer.setPipeline("Light2D");
        return _this;
    }
    ItemLayer.prototype.placeItem = function (tileIndex, object) {
        var _a = this.getCenterOfObject(object), x = _a[0], y = _a[1];
        var tile = this.layer.getTileAtWorldXY(x, y);
        if (!tile) {
            var tilePlaced = this.layer.putTileAtWorldXY(tileIndex, x, y);
            if (tilePlaced) {
                var preciseVector = this.layer.tileToWorldXY(tilePlaced.x, tilePlaced.y);
                var preciseX = preciseVector.x;
                var preciseY = preciseVector.y;
                if (tileIndex == PlayerStateClasses_1.Items.TORCH) {
                    this.scene.lights.addLight(preciseX, preciseY, 200).setIntensity(4);
                }
                return true;
            }
        }
        return false;
    };
    ItemLayer.prototype.removeItem = function (object) {
        var _a = this.getCenterOfObject(object), x = _a[0], y = _a[1];
        var tile = this.layer.getTileAtWorldXY(x, y);
        if (tile) {
            this.removeLightsAndTile(tile);
        }
    };
    ItemLayer.prototype.removeLightsAndTile = function (tile) {
        var preciseVector = this.layer.tileToWorldXY(tile.x, tile.y);
        var preciseX = preciseVector.x;
        var preciseY = preciseVector.y;
        if (tile.index == PlayerStateClasses_1.Items.TORCH) {
            var lightArray = this.scene.lights.lights;
            for (var i = lightArray.length - 1; i >= 0; i--) {
                var light = lightArray[i];
                if (light.x === preciseX && light.y === preciseY) {
                    this.scene.lights.removeLight(light); // Remove the light from the scene
                    break;
                }
            }
        }
        this.layer.removeTileAt(tile.x, tile.y);
    };
    return ItemLayer;
}(BaseLayer_1.default));
exports.default = ItemLayer;
