import GameScene from "~/GameScene";
import BaseLayer from "./BaseLayer";

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
        this.layer.setScale(2.35,2.35);
        this.generateRandomTiles(this.layer.tilemap.width, this.layer.tilemap.height);
        this.layer.setCollisionByExclusion([-1]);
    }
    mineBlock(direction: string) 
    {
        let tile = this.checkTileCollision(direction, this.scene.player);
        if (tile) {
            this.miningTile = tile;
            this.miningCooldown = this.scene.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: (x,y,index) => {
                    // Remove tile at coords
                    this.layer.removeTileAt(x,y)
                    this.scene.updateGold(oreMapping[index])
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
        //Get right frequencies
        let frequencyArr = [
            {
                0: 1,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0
            },
            {
                0: 0,
                1: 1,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0
            },
            {
                0: 0,
                1: 5,
                2: 5,
                3: 2,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0
            },
            {
                0: 0,
                1: 0,
                2: 80,
                3: 20,
                4: 10,
                5: 5,
                6: 3,
                7: 1,
                8: 0,
                9: 0
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
                8: 3,
                9: 0
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
                this.layer.putTileAt(tileIndex, x, y);
            }
        }
    }
    generateFrequencyArr(distribution: Record<integer,integer>)
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
    removeGround = (explosion, groundTile: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject) => {
        if(groundTile instanceof Phaser.Tilemaps.Tile)
        {
            this.layer.removeTileAt(groundTile.x,groundTile.y);
        }
        else
        {
            console.log("Got game object instead of tile");
        }
    }
}