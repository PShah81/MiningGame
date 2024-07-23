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
exports.oreMapping = void 0;
var BaseLayer_1 = require("./BaseLayer");
var InvisibleLayer_1 = require("./InvisibleLayer");
var oreMapping;
(function (oreMapping) {
    oreMapping[oreMapping["GRASS"] = 0] = "GRASS";
    oreMapping[oreMapping["DIRT"] = 1] = "DIRT";
    oreMapping[oreMapping["STONE"] = 2] = "STONE";
    oreMapping[oreMapping["COAL"] = 3] = "COAL";
    oreMapping[oreMapping["IRON"] = 4] = "IRON";
    oreMapping[oreMapping["COPPER"] = 5] = "COPPER";
    oreMapping[oreMapping["SILVER"] = 6] = "SILVER";
    oreMapping[oreMapping["GOLD"] = 7] = "GOLD";
    oreMapping[oreMapping["DIAMOND"] = 8] = "DIAMOND";
    oreMapping[oreMapping["EMERALD"] = 9] = "EMERALD";
    oreMapping[oreMapping["EMPTY"] = 10] = "EMPTY";
})(oreMapping || (exports.oreMapping = oreMapping = {}));
var orePrices;
(function (orePrices) {
    orePrices[orePrices["GRASS"] = 0] = "GRASS";
    orePrices[orePrices["DIRT"] = 0] = "DIRT";
    orePrices[orePrices["STONE"] = 0] = "STONE";
    orePrices[orePrices["COAL"] = 0.1] = "COAL";
    orePrices[orePrices["IRON"] = 0.3] = "IRON";
    orePrices[orePrices["COPPER"] = 0.4] = "COPPER";
    orePrices[orePrices["SILVER"] = 0.5] = "SILVER";
    orePrices[orePrices["GOLD"] = 1] = "GOLD";
    orePrices[orePrices["DIAMOND"] = 3] = "DIAMOND";
    orePrices[orePrices["EMERALD"] = 10] = "EMERALD";
})(orePrices || (orePrices = {}));
var GroundLayer = /** @class */ (function (_super) {
    __extends(GroundLayer, _super);
    function GroundLayer(scene, layer, x, y) {
        var _this = _super.call(this, scene, layer, x, y) || this;
        _this.groundExploded = function (explosion, groundTile) {
            if (groundTile instanceof Phaser.Tilemaps.Tile) {
                _this.removeGroundTiles(groundTile.x, groundTile.y);
            }
            else {
                console.error("Got game object instead of tile");
            }
        };
        _this.miningRate = 500;
        _this.mapCreation();
        _this.layer.setCollisionByExclusion([-1]);
        _this.layer.setPipeline("Light2D");
        return _this;
    }
    GroundLayer.prototype.mineBlock = function (direction) {
        var _this = this;
        var tile = this.checkTileCollision(direction, this.scene.player);
        if (tile) {
            this.miningTile = tile;
            this.miningCooldown = this.scene.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: function (x, y, index) {
                    // Remove tile at coords
                    _this.removeGroundTiles(x, y);
                    var price = orePrices[oreMapping[index]];
                    _this.scene.updateGold(price);
                    _this.miningCooldown = undefined;
                    _this.miningTile = undefined;
                },
                callbackScope: this,
                delay: this.miningRate,
            });
        }
    };
    GroundLayer.prototype.startMining = function (direction) {
        if (this.miningCooldown) {
            if (this.currentMiningDirection != direction) {
                // Stop current mining if in wrong direction
                this.stopMining();
                this.currentMiningDirection = direction;
                this.mineBlock(direction);
            }
            //else don't do anything, already started mining in the right direction
        }
        else {
            this.currentMiningDirection = direction;
            this.mineBlock(direction);
        }
    };
    GroundLayer.prototype.stopMining = function () {
        if (this.miningCooldown) {
            console.log("cooldown stopped");
            this.miningCooldown.remove(false);
            this.miningCooldown = undefined;
            this.miningTile = undefined;
            this.currentMiningDirection = undefined;
        }
    };
    GroundLayer.prototype.generateRandomTiles = function (width, height) {
        var weightedArray;
        var map = [];
        for (var y = 0; y < height; y++) {
            weightedArray = this.getWeightedArr(y);
            map[y] = [];
            for (var x = 0; x < width; x++) {
                // Generate a random tile index
                var weightedArrayIndex = Math.floor(Math.random() * weightedArray.length); // Get an index in the weighted array
                var tileIndex = weightedArray[weightedArrayIndex];
                map[y][x] = tileIndex;
            }
        }
        return map;
    };
    GroundLayer.prototype.getWeightedArr = function (depth) {
        // Standard
        // 1, 0.9, 0.6, 0.4, 0.2, 0.1, 0.05, 0.03, 0.02, 0
        var surface = {};
        surface[oreMapping.GRASS] = 1;
        surface[oreMapping.DIRT] = 0;
        surface[oreMapping.STONE] = 0;
        surface[oreMapping.COAL] = 0;
        surface[oreMapping.IRON] = 0;
        surface[oreMapping.COPPER] = 0;
        surface[oreMapping.SILVER] = 0;
        surface[oreMapping.GOLD] = 0;
        surface[oreMapping.DIAMOND] = 0;
        surface[oreMapping.EMERALD] = 0;
        surface[oreMapping.EMPTY] = 0;
        var subSurface = {};
        subSurface[oreMapping.GRASS] = 0;
        subSurface[oreMapping.DIRT] = 0.9;
        subSurface[oreMapping.STONE] = 0;
        subSurface[oreMapping.COAL] = 0;
        subSurface[oreMapping.IRON] = 0;
        subSurface[oreMapping.COPPER] = 0;
        subSurface[oreMapping.SILVER] = 0;
        subSurface[oreMapping.GOLD] = 0;
        subSurface[oreMapping.DIAMOND] = 0;
        subSurface[oreMapping.EMERALD] = 0;
        subSurface[oreMapping.EMPTY] = 0.1;
        var earlyDepth = {};
        earlyDepth[oreMapping.GRASS] = 0;
        earlyDepth[oreMapping.DIRT] = 0.2;
        earlyDepth[oreMapping.STONE] = 0.4;
        earlyDepth[oreMapping.COAL] = 0.2;
        earlyDepth[oreMapping.IRON] = 0;
        earlyDepth[oreMapping.COPPER] = 0;
        earlyDepth[oreMapping.SILVER] = 0;
        earlyDepth[oreMapping.GOLD] = 0;
        earlyDepth[oreMapping.DIAMOND] = 0;
        earlyDepth[oreMapping.EMERALD] = 0;
        earlyDepth[oreMapping.EMPTY] = 0.2;
        var midDepth = {};
        midDepth[oreMapping.GRASS] = 0;
        midDepth[oreMapping.DIRT] = 0;
        midDepth[oreMapping.STONE] = 0.4;
        midDepth[oreMapping.COAL] = 0.1;
        midDepth[oreMapping.IRON] = 0.1;
        midDepth[oreMapping.COPPER] = 0.05;
        midDepth[oreMapping.SILVER] = 0.03;
        midDepth[oreMapping.GOLD] = 0.02;
        midDepth[oreMapping.DIAMOND] = 0;
        midDepth[oreMapping.EMERALD] = 0;
        midDepth[oreMapping.EMPTY] = 0.3;
        var lateDepth = {};
        lateDepth[oreMapping.GRASS] = 0;
        lateDepth[oreMapping.DIRT] = 0;
        lateDepth[oreMapping.STONE] = 0.2;
        lateDepth[oreMapping.COAL] = 0.1;
        lateDepth[oreMapping.IRON] = 0.1;
        lateDepth[oreMapping.COPPER] = 0.1;
        lateDepth[oreMapping.SILVER] = 0.05;
        lateDepth[oreMapping.GOLD] = 0.03;
        lateDepth[oreMapping.DIAMOND] = 0.02;
        lateDepth[oreMapping.EMERALD] = 0;
        lateDepth[oreMapping.EMPTY] = 0.4;
        var finalDepth = {};
        finalDepth[oreMapping.GRASS] = 0;
        finalDepth[oreMapping.DIRT] = 0;
        finalDepth[oreMapping.STONE] = 0.2;
        finalDepth[oreMapping.COAL] = 0.1;
        finalDepth[oreMapping.IRON] = 0.1;
        finalDepth[oreMapping.COPPER] = 0.1;
        finalDepth[oreMapping.SILVER] = 0.1;
        finalDepth[oreMapping.GOLD] = 0.05;
        finalDepth[oreMapping.DIAMOND] = 0.03;
        finalDepth[oreMapping.EMERALD] = 0.02;
        finalDepth[oreMapping.EMPTY] = 0.4;
        var weightedArray = [];
        if (depth == 0) {
            weightedArray = this.generateFrequencyArr(surface);
        }
        else if (depth < 3) {
            weightedArray = this.generateFrequencyArr(subSurface);
        }
        else if (depth < 10) {
            weightedArray = this.generateFrequencyArr(earlyDepth);
        }
        else if (depth < 50) {
            weightedArray = this.generateFrequencyArr(midDepth);
        }
        else if (depth < 100) {
            weightedArray = this.generateFrequencyArr(lateDepth);
        }
        else {
            weightedArray = this.generateFrequencyArr(finalDepth);
        }
        return weightedArray;
    };
    GroundLayer.prototype.generateFrequencyArr = function (distribution) {
        var weightedArray = [];
        var arrayLength = 100;
        for (var index in distribution) {
            var frequency = distribution[index] * arrayLength;
            for (var i = 0; i < frequency; i++) {
                weightedArray.push(parseInt(index));
            }
        }
        return weightedArray;
    };
    GroundLayer.prototype.applyAutomataRules = function (map) {
        var newMap = [];
        for (var y = 0; y < map.length; y++) {
            newMap[y] = [];
            for (var x = 0; x < map[0].length; x++) {
                var emptyNeighbors = this.countEmptyNeighbors(map, x, y);
                //Don't want to change the grass
                if (y != 0) {
                    if (map[y][x] == oreMapping.EMPTY) {
                        newMap[y][x] = (emptyNeighbors >= 4) ? oreMapping.EMPTY : map[y][x];
                    }
                    else {
                        newMap[y][x] = (emptyNeighbors >= 5) ? oreMapping.EMPTY : map[y][x];
                    }
                }
                else {
                    newMap[y][x] = map[y][x];
                }
            }
        }
        return newMap;
    };
    GroundLayer.prototype.countEmptyNeighbors = function (map, x, y) {
        var emptyCount = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i != 0 || j != 0) {
                    var newX = x + i;
                    var newY = y + j;
                    //Valid tile location
                    if (newX >= 0 && newY >= 0 && newX < map[0].length && newY < map.length) {
                        if (map[newX][newY] == oreMapping.EMPTY) {
                            emptyCount += 1;
                        }
                    }
                }
            }
        }
        return emptyCount;
    };
    GroundLayer.prototype.addTiles = function (map) {
        for (var row = 0; row < map.length; row++) {
            for (var col = 0; col < map[0].length; col++) {
                if (map[row][col] != oreMapping.EMPTY) {
                    this.layer.putTileAt(map[row][col], col, row);
                }
            }
        }
    };
    GroundLayer.prototype.mapCreation = function () {
        var iterations = 5;
        this.map = this.generateRandomTiles(this.layer.tilemap.width, this.layer.tilemap.height);
        for (var i = 0; i < iterations; i++) {
            this.map = this.applyAutomataRules(this.map);
        }
        this.addTiles(this.map);
    };
    GroundLayer.prototype.findCaves = function (minCaveSize) {
        var caves = [];
        var visited = new Set();
        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[0].length; x++) {
                //Check that tile hasn't been visited yet and that the tile is empty
                if (!visited.has([x, y].toString()) && this.map[y][x] == oreMapping.EMPTY) {
                    var cave = this.findCave(x, y, this.map, visited);
                    if (cave.length >= minCaveSize) {
                        caves.push(cave);
                    }
                }
            }
        }
        return caves;
    };
    GroundLayer.prototype.findCave = function (x, y, map, visited) {
        var stack = [[x, y]];
        var cave = [];
        while (stack.length > 0) {
            var caveTuple = stack.pop();
            if (caveTuple) {
                var caveX = caveTuple[0], caveY = caveTuple[1];
                //Check that tile is valid
                if (InvisibleLayer_1.default.checkIfTileIsValid(caveX, caveY, this.layer)) {
                    //Check that tile hasn't been visited yet and that the tile is empty
                    if (!visited.has(caveTuple.toString()) && map[caveY][caveX] == oreMapping.EMPTY) {
                        visited.add(caveTuple.toString());
                        cave.push([caveX, caveY]);
                        var stackAdditions = [[caveX + 1, caveY], [caveX - 1, caveY], [caveX, caveY + 1], [caveX, caveY - 1]];
                        for (var _i = 0, stackAdditions_1 = stackAdditions; _i < stackAdditions_1.length; _i++) {
                            var additionTuple = stackAdditions_1[_i];
                            var additionX = additionTuple[0], additionY = additionTuple[1];
                            //Check if tile is valid and hasn't been visited yet
                            if (InvisibleLayer_1.default.checkIfTileIsValid(additionX, additionY, this.layer) && !visited.has(additionTuple.toString())) {
                                stack.push(additionTuple);
                            }
                        }
                    }
                }
            }
        }
        return cave;
    };
    return GroundLayer;
}(BaseLayer_1.default));
exports.default = GroundLayer;
