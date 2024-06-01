import Phaser from 'phaser'
import PlayerStateManager from './PlayerStateManager';
import TileComponent from './TileComponent';

class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('game-scene');
        this.miningRate = 750;
        this.gold = 0;
        this.lastActionState = null;
        this.actionState = null;
        this.movementState = null;
        this.miningCooldown = null;
        this.miningTile = null;
        this.currentMiningDirection = null;
        this.lastKeyPressed = null;

    }

    preload ()
    {
        this.load.spritesheet('tiles', '../assets/sprites/ores.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('items', '../assets/sprites/Extras/items.png', { frameWidth: 16, frameHeight: 16});
        this.load.image('sky', '../assets/sprites/sky.png');
        this.load.image('underground', '../assets/sprites/background.png');
        this.load.image('goldImage', '../assets/sprites/gold.png');
        this.load.spritesheet("mine", '../assets/sprites/3 SteamMan/mine.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("walk", '../assets/sprites/3 SteamMan/walk.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("idle", '../assets/sprites/3 SteamMan/idle.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("jump", '../assets/sprites/3 SteamMan/jump.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("run", '../assets/sprites/3 SteamMan/run.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("climb", '../assets/sprites/3 SteamMan/climb.png', { frameWidth: 48, frameHeight: 48});
    }

    create ()
    {
        
        this.add.image(400,300, 'sky');

        // Background that shows after a block has been mined
        let underground = this.add.image(0,500, 'underground');
        underground.setOrigin(0,0)
        underground.setDisplaySize(this.game.canvas.width, this.game.canvas.height - 500)


        this.map = this.make.tilemap({ width: 25, height: 200, tileWidth: 16, tileHeight: 16});


        let itemTileset = this.map.addTilesetImage('items', null, 16, 16);
        this.itemLayer = this.map.createBlankLayer('itemLayer', itemTileset);
        this.itemLayer.setScale(2.35,2.35)
        this.itemLayer.x = 0;
        this.itemLayer.y = 500;

        this.itemLayer.putTileAt(0, 0, 0);

        let groundTileset = this.map.addTilesetImage('tiles', null, 16, 16);
        this.groundLayer = this.map.createBlankLayer('groundLayer', groundTileset);
        this.groundLayer.setScale(2.35,2.35);
        this.groundLayer.x = 0;
        this.groundLayer.y = 500;

        

        this.TileComponent = new TileComponent(this);

        this.TileComponent.generateRandomTiles(this.map.width, this.map.height);


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
        this.player.body.setSize(26,36);
        this.player.body.setOffset(12, 12);
        this.player.setMaxVelocity(250);


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


        this.TileComponent = new TileComponent(this);
        this.PlayerStateManager = new PlayerStateManager(this, this.player, this.TileComponent);

        //Adding key presses
        this.input.keyboard.on('keydown', this.handleKeyPress, this);
    
    }

    update () 
    {
        this.PlayerStateManager.update(this.cursors, this.lastKeyPressed);
        this.lastKeyPressed = null;
        // Reset the lastKeyPressed after processing
    }
    handleKeyPress(event)
    {
        this.lastKeyPressed = event.keyCode
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
        });
        this.anims.create({
            key: "fall",
            frames: [
                { key: 'jump', frame: 3}
            ],
            frameRate: 5
        });
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers('run', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "climbUp",
            frames: this.anims.generateFrameNumbers('climb', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "climbDown",
            frames: this.anims.generateFrameNumbers('climb', { start: 5, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
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

export default GameScene