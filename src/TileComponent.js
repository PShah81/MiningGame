class TileComponent {
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.player;
        this.groundLayer = this.scene.groundLayer;
        this.tileIndexMapping = {
            0: "grass",
            1: "dirt",
            2: "stone",
            3: "coal",
            4: "iron",
            5: "copper",
            6: "silver",
            7: "gold",
            8: "diamond",
            9: "emerald"
        }
    }
    checkTileCollision(direction) 
    {
        let tile;
        //use body more reliable
        //center x on body
        //keep y at bottom as the swing is more down than to the side
        let width = this.player.body.width
        let height = this.player.body.height
        let x = this.player.body.x + Math.floor(width/2)
        let y = this.player.body.y + Math.floor(height/2)
        if (direction == "left")
        {
            tile = this.groundLayer.getTileAtWorldXY(x - width, y);
        }
        else if (direction == "right")
        {
            tile = this.groundLayer.getTileAtWorldXY(x + width, y);
        }
        else
        {
            tile = this.groundLayer.getTileAtWorldXY(x, y+height);
        }
        return tile;
    }
    mineBlock(direction) 
    {
        let tile = this.checkTileCollision(direction);
        if (tile) {
            this.scene.miningTile = tile;
            this.scene.miningCooldown = this.scene.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: (x,y,index) => {
                    // Remove tile at coords
                    this.groundLayer.removeTileAt(x,y)
                    this.scene.updateGold(this.tileIndexMapping[index])
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
            console.log("cooldown stopped")
            this.scene.miningCooldown.remove(false);
            this.scene.miningCooldown = null;
            this.scene.miningTile = null;
            this.scene.currentMiningDirection = null;
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
        let weightedArray = []
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
                this.groundLayer.putTileAt(tileIndex, x, y);
            }
        }
    }
    generateFrequencyArr(distribution)
    {
        let weightedArray = [];
        for (let number in distribution) {
            let frequency = distribution[number];
            for (let i = 0; i < frequency; i++) {
                weightedArray.push(Number(number));
            }
        }
        return weightedArray;
    }
}

export default TileComponent