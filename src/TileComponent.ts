import GameScene from "./GameScene";
import { Directions } from "./PlayerStateClasses";

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
    EMERALD = 9
}
class TileComponent {
    scene: GameScene
    player: Phaser.Physics.Arcade.Sprite | null
    itemLayer: Phaser.Tilemaps.TilemapLayer | null
    groundLayer: Phaser.Tilemaps.TilemapLayer | null
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.player;
        this.groundLayer = this.scene.groundLayer;
        this.itemLayer = this.scene.itemLayer;
    }
    getCenter(object)
    {
        let width = object.body.width;
        let height = object.body.height;
        let x = object.body.x + Math.floor(width/2);
        let y = object.body.y + Math.floor(height/2);
        return [x,y];
    }
    checkTileCollision(direction, layer) 
    {
        let tile;
        let width;
        let height;
        if(this.player && this.player.body)
        {
            width = this.player.body.width;
            height = this.player.body.height;
        }
        let [x,y] = this.getCenter(this.player);
        if (direction == "left")
        {
            tile = layer.getTileAtWorldXY(x - width, y);
        }
        else if (direction == "right")
        {
            tile = layer.getTileAtWorldXY(x + width, y);
        }
        else if(direction == "down")
        {
            tile = layer.getTileAtWorldXY(x, y+height);
        }
        else
        {
            tile = layer.getTileAtWorldXY(x, y-height);
        }
        return tile;
    }
    mineBlock(direction) 
    {
        let tile = this.checkTileCollision(direction, this.groundLayer);
        if (tile) {
            this.scene.miningTile = tile;
            this.scene.miningCooldown = this.scene.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: (x,y,index) => {
                    // Remove tile at coords
                    if(this.groundLayer)
                    {
                        this.groundLayer.removeTileAt(x,y)
                    }
                    this.scene.updateGold(oreMapping[index])
                    this.scene.miningCooldown = null
                    this.scene.miningTile = null
                },
                callbackScope: this,
                delay: this.scene.miningRate,
            });
        }
    }
    startMining(direction) 
    {
        if(this.scene.miningCooldown)
        {
            if(this.scene.currentMiningDirection != direction)
            {
                // Stop current mining if in wrong direction
                this.stopMining();
                this.scene.currentMiningDirection = direction;
                this.mineBlock(direction);
            }
            //else don't do anything, already started mining in the right direction
        }
        else
        {
            this.scene.currentMiningDirection = direction;
            this.mineBlock(direction);
        }
    }
    stopMining() 
    {
        if(this.scene.miningCooldown)
        {
            console.log("cooldown stopped");
            this.scene.miningCooldown.remove(false);
            this.scene.miningCooldown = null;
            this.scene.miningTile = null;
            this.scene.currentMiningDirection = null;
        }
    }
    getItemAtPlayer()
    {
        let [x,y] = this.getCenter(this.player);
        let tile;
        if(this.itemLayer)
        {
            tile = this.itemLayer.getTileAtWorldXY(x, y);
        }
        return tile
    }
    placeItem(tileIndex)
    {
        let [x,y] = this.getCenter(this.player);
        let tile;
        if(this.itemLayer)
        {
            tile = this.itemLayer.getTileAtWorldXY(x, y);
        }
        if(!tile && this.itemLayer)
        {
            this.itemLayer.putTileAtWorldXY(tileIndex, x, y);
        }
    }
    generateRandomTiles(width, height) 
    {
        //Get right frequencies
        let frequencyArr = [
            {
                0: 1
            },
            {
                0: 0,
                1: 1
            },
            {
                0: 0,
                1: 5,
                2: 5,
                3: 2
            },
            {
                0: 0,
                1: 0,
                2: 80,
                3: 20,
                4: 10,
                5: 5,
                6: 3,
                7: 1
            },
            {
                0: 0,
                1: 0,
                2: 200,
                3: 80,
                4: 40,
                5: 20,
                6: 10,
                7: 5,
                8: 3
            },
            {
                0: 0,
                1: 0,
                2: 200,
                3: 40,
                4: 80,
                5: 40,
                6: 20,
                7: 10,
                8: 5,
                9: 1
            },
        ]
        let weightedArray: integer[] = [];
        for (let y = 0; y < height; y++) {
            if (y == 0)
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[0])
            }
            else if (y < 3)
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[1])
            }
            else if (y < 10)
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[2])
            }
            else if (y < 40)
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[3])
            }
            else if(y < 100)
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[4])
            }
            else
            {
                weightedArray = this.generateFrequencyArr(frequencyArr[5])
            }
            for (let x = 0; x < width; x++) {
                // Generate a random tile index
                let weightedArrayIndex  = Math.floor(Math.random() * weightedArray.length) // Get an index in the weighted array
                let tileIndex = weightedArray[weightedArrayIndex];
                if(this.groundLayer)
                {
                    this.groundLayer.putTileAt(tileIndex, x, y);
                }
            }
        }
    }
    generateFrequencyArr(distribution)
    {
        let weightedArray: integer[] = [];
        for (let number in distribution) {
            let frequency = distribution[number];
            for (let i = 0; i < frequency; i++) {
                weightedArray.push(parseInt(number));
            }
        }
        return weightedArray;
    }
}

export default TileComponent