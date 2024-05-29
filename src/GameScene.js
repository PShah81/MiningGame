import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('game-scene');
        this.miningRate = 400;
        this.miningTimerRate = 200;
        this.bufferZone = 20;
        this.gold = 0;
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
        this.lastMovement = null;

    }

    preload ()
    {
        this.load.spritesheet('tiles', '../assets/sprites/ores.png', { frameWidth: 16, frameHeight: 16});
        this.load.image('sky', '../assets/sprites/sky.png');
        this.load.image('underground', '../assets/sprites/background.png');
        this.load.image('goldImage', '../assets/sprites/gold.png');
        this.load.spritesheet("mine", '../assets/sprites/3 SteamMan/mine.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("walk", '../assets/sprites/3 SteamMan/walk.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("idle", '../assets/sprites/3 SteamMan/idle.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("jump", '../assets/sprites/3 SteamMan/jump.png', { frameWidth: 48, frameHeight: 48});
    }

    create ()
    {
        
        this.add.image(400,300, 'sky');

        // Background that shows after a block has been mined
        let underground = this.add.image(0,500, 'underground');
        underground.setOrigin(0,0)
        underground.setDisplaySize(this.game.canvas.width, this.game.canvas.height - 500)


        this.map = this.make.tilemap({ width: 25, height: 200, tileWidth: 16, tileHeight: 16});
        let tileset = this.map.addTilesetImage('tiles', null, 16, 16);
        this.groundLayer = this.map.createBlankLayer('groundLayer', tileset);
        this.groundLayer.setScale(2.35,2.35);
        this.groundLayer.x = 0;
        this.groundLayer.y = 500;

        this.generateRandomTiles(this.map.width, this.map.height);


        // Gold Bar text
        this.goldText = this.add.text(this.game.canvas.width-50, 5, String(this.gold.toFixed(1)), {
            fontSize: '32px',
            fill: '#ffffff'
        });
        this.goldText.setOrigin(1, 0);
        //Keep it in the same position relative to the viewport
        this.goldText.scrollFactorX = 0
        this.goldText.scrollFactorY = 0

        //Gold Bar image
        let goldImage = this.add.image(this.game.canvas.width-10, 5, 'goldImage');
        goldImage.setOrigin(1,0);
        goldImage.setScale(2,2);
        goldImage.scrollFactorX = 0;
        goldImage.scrollFactorY = 0;

        //Player code
        this.player = this.physics.add.sprite(400, 300, "idle").setScale(1);
        this.player.body.setSize(28,36);
        this.player.body.setOffset(11, 12);


        //Collision Code
        this.player.setCollideWorldBounds(true);
        this.groundLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.groundLayer);

        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create Animations
        this.createAnimations();

        //Follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.height = 1000;
    
    }

    update () 
    {
        this.keyDown = null;
        this.handleArrowKeys();  
        if(!this.lastMovement)
        {
            this.player.anims.play("idle", true);
        }
    }

    handleArrowKeys()
    {

        let keyDown = null;
        //Handle jump
        if(this.lastMovement == "jump" && this.player.body.onFloor())
        {
            this.lastMovement = "land"
            this.player.anims.play("land", true).on('animationcomplete-land', this.landedJump, this);
        }

        //Horizontal Motion
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            keyDown = "left"
            
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            keyDown = "right";
        }
        else
        {
            this.player.setVelocityX(0);
        }

        //Vertical Motion
        if (this.cursors.up.isDown && this.player.body.onFloor() && this.lastMovement != "land" && this.lastMovement != "jump") 
        {
            keyDown = "up";
            this.player.setVelocityY(-310);
        }
        else if(this.cursors.down.isDown) {
            keyDown = "down"; 
        }


        //Mining
        if(this.lastMovement != "jump" && this.lastMovement != "land")
        {
            switch (keyDown) {
                case "left":
                    this.startMining("left");   
                    break;
                case "right":
                    this.startMining("right");   
                    break;
                case "down":
                    this.startMining("down");   
                    break;
                default:
                    //If no mining directions occur stop mining
                    this.stopMining();
                    break;
            }
        }

        

        //Animations
        if(this.lastMovement != "jump" && this.lastMovement != "land")
        {
            switch (keyDown) {
                case "left":
                    if(this.miningCooldown && this.currentMiningDirection == "left")
                    {
                        this.player.anims.play("mine",true);
                    }
                    else
                    {
                        this.player.anims.play("walk",true);
                    }
                    this.lastMovement = "left";
                    break;
                case "right":
                    if(this.miningCooldown && this.currentMiningDirection == "right")
                    {
                        this.player.anims.play("mine",true);
                    }
                    else
                    {
                        console.log("walk")
                        this.player.anims.play("walk",true);
                    }
                    this.lastMovement = "right";
                    break;
                case "down":
                    if(this.miningCooldown && this.currentMiningDirection == "down")
                    {
                        this.player.anims.play("mine", true);
                        this.lastMovement = "down";
                    }
                    else
                    {
                        this.lastMovement = null;
                    }
                    break;
                case "up":
                    this.player.anims.play("jump", true);
                    this.lastMovement = "jump";
                    break;
                default:
                    this.lastMovement = null;
                    break;
            }
            
        }
    }
    landedJump()
    {
        this.lastMovement = null;
    }
    createAnimations()
    {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'mine',
            frames: this.anims.generateFrameNumbers('mine', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "jump",
            frames: [
                { key: 'jump', frame: 0, duration: 30 },
                { key: 'jump', frame: 1, duration: 50 }, 
                { key: 'jump', frame: 2, duration: 50 }, 
                { key: 'jump', frame: 3, duration: 1000 }
            ],
            frameRate: 5
        });
        this.anims.create({
            key: "land",
            frames: [
                { key: 'jump', frame: 4, duration: 50 },
                { key: 'jump', frame: 5, duration: 100 },
                { key: 'idle', frame: 0, duration: 50}
            ],
            frameRate: 5
        })
    }
    mineBlock(direction) 
    {
        if(this.miningCooldown)
        {
            return
        }
        let tile;
        //use body more reliable
        //center body
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
        if (tile) {
            this.miningCooldown = this.time.addEvent({
                args: [tile.x, tile.y, tile.index],
                callback: (x,y,index) => {
                    // Remove tile at coords
                    this.groundLayer.removeTileAt(x,y)
                    this.updateGold(this.tileIndexMapping[index])
                    this.miningCooldown = null
                },
                callbackScope: this,
                delay: this.miningRate,
            });
        }
    }
    startMining(direction) 
    {
        
        if (this.miningTimer) {
            if(this.currentMiningDirection == direction)
            {
                return
            }
            else
            {
                // Stop current miner if running in wrong direction
                this.stopMining();
            }
        }
        this.currentMiningDirection = direction;
        this.miningTimer = this.time.addEvent({
            args: [direction],
            callback: this.mineBlock,
            callbackScope: this,
            delay: this.miningTimerRate,
            loop: true
        });
    }
    stopMining() 
    {
        if (this.miningTimer) {
            this.miningTimer.remove(false); // The `false` argument prevents the timer from being automatically destroyed
            if(this.miningCooldown)
            {
                console.log("cooldown stopped")
                this.miningCooldown.remove(false);
                this.miningCooldown = null;
            }
            this.miningTimer = null;
            this.currentMiningDirection = null; // Reset the current mining direction
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
    updateGold(material)
    {
        let priceChart = {
            "grass": 0,
            "dirt": 0,
            "stone": 0,
            "coal" : 0.1,
            "iron" : 0.2,
            "copper": 0.3,
            "silver": 0.5,
            "gold": 1,
            "diamond": 3,
            "emerald": 10
        }
        this.gold += (priceChart[material]);
        this.goldText.setText(String(this.gold.toFixed(1)))
    }
}