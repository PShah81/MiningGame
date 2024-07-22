import GameScene from "../GameScene";
import BaseLayer from "./BaseLayer";
import InvisibleLayer from "./InvisibleLayer";

export enum oreMapping {
    GRASS = 0,
    DIRT = 1,
    STONE = 2,
    COAL = 3,
    IRON = 4,
    COPPER = 5,
    SILVER = 6,
    GOLD = 7,
    DIAMOND = 8,
    EMERALD = 9,
    EMPTY = 10
}
enum orePrices {
    GRASS = 0,
    DIRT = 0,
    STONE = 0,
    COAL = 0.1,
    IRON = 0.3,
    COPPER = 0.4,
    SILVER = 0.5,
    GOLD = 1,
    DIAMOND = 3,
    EMERALD = 10
}
export default class GroundLayer extends BaseLayer
{
    miningCooldown?: Phaser.Time.TimerEvent
    miningTile?: Phaser.Tilemaps.Tile
    miningRate: integer
    currentMiningDirection?: string
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
        this.miningRate = 750;
        this.mapCreation();
        this.layer.setCollisionByExclusion([-1]);
        this.layer.setPipeline("Light2D");
    }
    mineBlock(direction: string) 
    {
        let tile = this.checkTileCollision(direction, this.scene.player);
        if (tile) {
            this.miningTile = tile;
            this.miningCooldown = this.scene.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: (x: integer, y: integer, index: integer) => {
                    // Remove tile at coords
                    this.removeGroundTiles(x,y);
                    let price = orePrices[oreMapping[index] as keyof typeof orePrices];
                    this.scene.updateGold(price);
                    this.miningCooldown = undefined;
                    this.miningTile = undefined;
                },
                callbackScope: this,
                delay: this.miningRate,
            });
        }
    }
    startMining(direction: string) 
    {
        if(this.miningCooldown)
        {
            if(this.currentMiningDirection != direction)
            {
                // Stop current mining if in wrong direction
                this.stopMining();
                this.currentMiningDirection = direction;
                this.mineBlock(direction);
            }
            //else don't do anything, already started mining in the right direction
        }
        else
        {
            this.currentMiningDirection = direction;
            this.mineBlock(direction);
        }
    }
    stopMining() 
    {
        if(this.miningCooldown)
        {
            console.log("cooldown stopped");
            this.miningCooldown.remove(false);
            this.miningCooldown = undefined;
            this.miningTile = undefined;
            this.currentMiningDirection = undefined;
        }
    }
    generateRandomTiles(width: integer, height: integer) 
    {
        let weightedArray;
        let map: number[][] = [];
        for (let y = 0; y < height; y++) {
            weightedArray = this.getWeightedArr(y);
            map[y] = [];
            for (let x = 0; x < width; x++) {
                // Generate a random tile index
                let weightedArrayIndex  = Math.floor(Math.random() * weightedArray.length) // Get an index in the weighted array
                let tileIndex = weightedArray[weightedArrayIndex];
                map[y][x] = tileIndex;
            }
        }
        return map;
    }
    getWeightedArr(depth: number)
    {
        let surface = {0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0};
        let subSurface = {0: 0, 1: 0.9, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0.1};
        let earlyDepth = {0: 0, 1: 0.4, 2: 0.3, 3: 0.1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0.2};
        let midDepth = {0: 0, 1: 0, 2: 0.4, 3: 0.15, 4: 0.05, 5: 0.03, 6: 0.02, 7: 0.01, 8: 0, 9: 0, 10: 0.3};
        let lateDepth = {0: 0, 1: 0, 2: 0.4, 3: 0.1, 4: 0.05, 5: 0.05, 6: 0.05, 7: 0.03, 8: 0.02, 9: 0, 10: 0.3};
        let finalDepth = {0: 0, 1: 0, 2: 0.3, 3: 0.1, 4: 0.15, 5: 0.07, 6: 0.03, 7: 0.02, 8: 0.02, 9: 0.01, 10: 0.3};
        let weightedArray: integer[] = [];
        if (depth == 0)
        {
            weightedArray = this.generateFrequencyArr(surface)
        }
        else if (depth < 3)
        {
            weightedArray = this.generateFrequencyArr(subSurface)
        }
        else if (depth < 10)
        {
            weightedArray = this.generateFrequencyArr(earlyDepth)
        }
        else if (depth < 40)
        {
            weightedArray = this.generateFrequencyArr(midDepth)
        }
        else if(depth < 100)
        {
            weightedArray = this.generateFrequencyArr(lateDepth)
        }
        else
        {
            weightedArray = this.generateFrequencyArr(finalDepth)
        }
        return weightedArray;
    }
    generateFrequencyArr(distribution: Record<integer,integer>)
    {
        let weightedArray = [];
        let arrayLength = 100;
        
        for (let index in distribution) {
            let frequency = distribution[index]*arrayLength;
            for (let i = 0; i < frequency; i++) {
                weightedArray.push(parseInt(index));
            }
        }
        return weightedArray;
    }
    groundExploded = (explosion: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, groundTile: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject) => {
        if(groundTile instanceof Phaser.Tilemaps.Tile)
        {
            this.removeGroundTiles(groundTile.x,groundTile.y);
        }
        else
        {
            console.error("Got game object instead of tile");
        }
    }
    applyAutomataRules(map: number[][]) 
    {
        let newMap: number[][] = [];
        for (let y = 0; y < map.length; y++) {
            newMap[y] = [];
            for (let x = 0; x < map[0].length; x++) {
                let emptyNeighbors = this.countEmptyNeighbors(map, x, y);
                //Don't want to change the grass
                if(y != 0)
                {
                    if (map[y][x] == oreMapping.EMPTY) {
                        newMap[y][x] = (emptyNeighbors >= 4) ? oreMapping.EMPTY : map[y][x];
                    } else {
                        newMap[y][x] = (emptyNeighbors >= 5) ? oreMapping.EMPTY : map[y][x];
                    }
                }
                else
                {
                    newMap[y][x] = map[y][x];
                }
            }
        }
        return newMap;
    }
    countEmptyNeighbors(map: number[][], x: integer, y: integer) 
    {
        let emptyCount = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i != 0 || j != 0)
                {
                    let newX = x + i;
                    let newY = y + j;
                    //Valid tile location
                    if (newX >= 0 && newY >= 0 && newX < map[0].length && newY < map.length) {
                        if(map[newX][newY] == oreMapping.EMPTY)
                        {
                            emptyCount += 1;
                        }
                    }
                }
                
            }
        }
        return emptyCount;
    }
    addTiles(map: number[][]) 
    {
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[0].length; col++) {
                if(map[row][col] != oreMapping.EMPTY)
                {
                    this.layer.putTileAt(map[row][col], col, row);
                }
            }
        }
    }
    mapCreation()
    {
        let iterations = 10;
        let map = this.generateRandomTiles(this.layer.tilemap.width, this.layer.tilemap.height);
        for (let i = 0; i < iterations; i++) {
            map = this.applyAutomataRules(map);
        }
        this.addTiles(map);
        console.log(this.findCaves(map, 10))
    }
    findCaves(map: number[][], minCaveSize: number) {
        let caves: number[][][] = [];
        let visited = new Set<String>();
    
        
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[0].length; x++) {
                //Check that tile hasn't been visited yet and that the tile is empty
                if (!visited.has([x,y].toString()) && map[y][x] == oreMapping.EMPTY) {
                    let cave = this.findCave(x, y, map, visited);
                    if (cave.length >= minCaveSize) {
                        caves.push(cave);
                    }
                }
            }
        }
        return caves;
    }
    findCave(x: number, y: number, map: number[][], visited: Set<String>) {
        let stack = [[x, y]];
        let cave: number[][] = [];
        while (stack.length > 0) {
            let caveTuple = stack.pop();
            if(caveTuple)
            {
                let [caveX, caveY] = caveTuple;
                //Check that tile is valid
                if (InvisibleLayer.checkIfTileIsValid(caveX, caveY, this.layer))
                {
                    //Check that tile hasn't been visited yet and that the tile is empty
                    if (!visited.has(caveTuple.toString()) && map[caveY][caveX] == oreMapping.EMPTY)
                    {
                        visited.add(caveTuple.toString());
                        cave.push([caveX, caveY]);
                        let stackAdditions = [[caveX + 1, caveY], [caveX - 1, caveY], [caveX, caveY + 1], [caveX, caveY - 1]];
                        
                        
                        for(let additionTuple of stackAdditions)
                        {
                            let [additionX, additionY] = additionTuple;
                            //Check if tile is valid and hasn't been visited yet
                            if(InvisibleLayer.checkIfTileIsValid(additionX, additionY, this.layer) && !visited.has(additionTuple.toString()))
                            {
                                stack.push(additionTuple);
                            }
                            
                        }
                    }
                }
            }
        }
        return cave;
    }
}