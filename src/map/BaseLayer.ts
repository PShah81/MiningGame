import GameScene from "../GameScene";
import Player from "../player/Player";

export default class BaseLayer
{
    scene: GameScene
    layer: Phaser.Tilemaps.TilemapLayer
    constructor(scene, layer, x, y)
    {
        this.layer = layer;
        this.scene = scene;
        this.layer.x = x;
        this.layer.y = y;
    }
    getCenterOfObject(object)
    {
        let width = object.body.width;
        let height = object.body.height;
        let x = object.body.x + Math.floor(width/2);
        let y = object.body.y + Math.floor(height/2);
        return [x,y];
    }
    checkTileCollision(direction, object) 
    {
        let tile;
        let width;
        let height;
        if(object && object.body)
        {
            width = object.body.width;
            height = object.body.height;
        }
        let [x,y] = this.getCenterOfObject(object);
        if (direction == "left")
        {
            tile = this.layer.getTileAtWorldXY(x - width, y);
        }
        else if (direction == "right")
        {
            tile = this.layer.getTileAtWorldXY(x + width, y);
        }
        else if(direction == "down")
        {
            tile = this.layer.getTileAtWorldXY(x, y+height);
        }
        else
        {
            tile = this.layer.getTileAtWorldXY(x, y-height);
        }
        return tile;
    }
    getTileAtObject(object)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        return tile
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
                this.layer.putTileAt(tileIndex, x, y);
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
    handleDynamite()
    {
        let [x,y] = this.getCenterOfObject(this.scene.player);
        let dynamite = this.scene.physics.add.sprite(x, y, "dynamite");
        if(this.scene.dynamiteColliderGroup)
        {
            this.scene.dynamiteColliderGroup.add(dynamite);
        }
        dynamite.anims.play("dynamite", true);
        let explosion;
        
        dynamite.on('animationcomplete-dynamite', () =>{
            let x = dynamite.x;
            let y = dynamite.y;
            dynamite.destroy();
            explosion = this.scene.physics.add.sprite(x, y, "explosion");
            if(this.scene.explosionOverlapGroup)
            {
                this.scene.explosionOverlapGroup.add(explosion);
            }
            explosion.body.setAllowGravity(false);
            explosion.body.setVelocityY(0);
            explosion.setScale(3);
            explosion.anims.play("explosion", true);
            explosion.on('animationcomplete-explosion', function() {
                explosion.destroy()
            });
        });
    }
}