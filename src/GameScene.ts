import Phaser from 'phaser'
import PlayerStateManager from './player/PlayerStateManager';
import Player from './player/Player';
import GroundLayer from './map/GroundLayer';
import ItemLayer from './map/ItemLayer';
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
class GameScene extends Phaser.Scene
{
    miningRate: integer
    gold: integer
    goldText?: Phaser.GameObjects.Text
    miningCooldown?: Phaser.Time.TimerEvent
    miningTile?: Phaser.Tilemaps.Tile
    currentMiningDirection?: string
    lastKeyPressed?: Phaser.Input.Keyboard.Key
    map?: Phaser.Tilemaps.Tilemap
    itemLayer: Phaser.Tilemaps.TilemapLayer | null
    groundLayer: Phaser.Tilemaps.TilemapLayer | null
    ItemLayer?: ItemLayer
    GroundLayer?: GroundLayer
    player?: Player
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    dynamiteColliderGroup?: Phaser.Physics.Arcade.Group
    explosionOverlapGroup?: Phaser.Physics.Arcade.Group
    PlayerStateManager?: PlayerStateManager
    constructor()
    {
        super('game-scene');
        this.miningRate = 750;
        this.gold = 0;
        this.itemLayer = null;
        this.groundLayer = null;
    }

    preload ()
    {
        this.load.spritesheet('tiles', '../assets/sprites/ores.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('items', '../assets/sprites/Extras/items.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('dynamite', '../assets/sprites/Extras/dynamite.png', {frameWidth: 22, frameHeight: 24});
        this.load.spritesheet('explosion', '../assets/sprites/Extras/explosion.png', {frameWidth: 32, frameHeight: 32})
        this.load.image('sky', '../assets/sprites/sky.png');
        this.load.image('underground', '../assets/sprites/background.png');
        this.load.image('goldImage', '../assets/sprites/gold.png');
        this.load.spritesheet("mine", '../assets/sprites/3 SteamMan/mine.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("walk", '../assets/sprites/3 SteamMan/walk.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("idle", '../assets/sprites/3 SteamMan/idle.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("jump", '../assets/sprites/3 SteamMan/jump.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("run", '../assets/sprites/3 SteamMan/run.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("climb", '../assets/sprites/3 SteamMan/climb.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("attack", '../assets/sprites/3 SteamMan/attack.png', { frameWidth: 48, frameHeight: 48});
    }

    create ()
    {
        
        this.add.image(400,300, 'sky');

        // Background that shows after a block has been mined
        let underground = this.add.image(0,500, 'underground');
        underground.setOrigin(0,0)
        underground.setDisplaySize(this.game.canvas.width, this.game.canvas.height - 500)


        this.map = this.make.tilemap({ width: 25, height: 200, tileWidth: 16, tileHeight: 16});

        //Initialize map layers
        let itemTileset = this.map.addTilesetImage('items', undefined, 16, 16);
        if(itemTileset)
        {
            let itemLayer = this.map.createBlankLayer('itemLayer', itemTileset);
            this.ItemLayer = new ItemLayer(this, itemLayer, 0, 500);
        }
        else
        {
            console.log("Failed to load the tileset image");
        }
       
        let groundTileset = this.map.addTilesetImage('tiles', undefined, 16, 16);
        if(groundTileset)
        {
            let groundLayer = this.map.createBlankLayer('groundLayer', groundTileset);
            this.GroundLayer = new GroundLayer(this, groundLayer, 0, 500);
        }
        else
        {
            console.log("Failed to load the tileset image");
        }


        // Gold Bar text
        this.goldText = this.add.text(this.game.canvas.width-50, 5, String(this.gold.toFixed(1)), {
            fontSize: '32px'
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

        // Create Animations
        this.createAnimations();
        
        //Player code
        if(this.GroundLayer && this.ItemLayer)
        {
            this.player = new Player(this, 400, 300, "idle", this.GroundLayer, this.ItemLayer);
        }



        ////Collision Code
        this.dynamiteColliderGroup = this.physics.add.group({
            defaultKey: 'dynamite',
            collideWorldBounds: true
        })

        this.explosionOverlapGroup = this.physics.add.group({
            defaultKey: 'explosion',
            collideWorldBounds: true
        })
        if(this.GroundLayer && this.player)
        {
            this.physics.add.collider(this.player, this.GroundLayer.layer);
            this.physics.add.collider(this.dynamiteColliderGroup, this.GroundLayer.layer);
            this.physics.add.overlap(this.explosionOverlapGroup, this.GroundLayer.layer, this.GroundLayer?.removeGround, undefined, this);
        }
        if(this.ItemLayer && this.player)
        {
            this.physics.add.overlap(this.player, this.ItemLayer.layer, this.ItemLayer.canClimb, undefined, this);
            this.physics.add.overlap(this.explosionOverlapGroup, this.ItemLayer.layer, this.ItemLayer?.removeItems, undefined, this);
        }


        ////Input Events
        if(this.input && this.input.keyboard)
        {
            this.cursors = this.input.keyboard.createCursorKeys();
            //Adding key presses
            this.input.keyboard.on('keydown', this.handleKeyPress, this);
        }

        //Follow the player
        if(this.player)
        {
            this.cameras.main.startFollow(this.player);
        }
        this.cameras.main.height = 1000;


    }

    update () 
    {
        if(this.player)
        {
            this.player.update(this.cursors, this.lastKeyPressed)
        }
        // Reset the lastKeyPressed after processing
        this.lastKeyPressed = undefined;
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
                { key: 'jump', frame: 0},
                { key: 'jump', frame: 1}, 
                { key: 'jump', frame: 2},
                { key: 'jump', frame: 3}
            ],
            frameRate: 20
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
        this.anims.create({
            key: "climbIdle",
            frames: [
                { key: 'climb', frame: 0}
            ],
            frameRate: 5
        });
        this.anims.create({
            key: "dynamite",
            frames: this.anims.generateFrameNumbers('dynamite', { start: 0, end: 4 }),
            frameRate: 3
        });
        this.anims.create({
            key: "explosion",
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 4 }),
            frameRate: 3
        });
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers('attack', { start: 0, end: 5 }),
            frameRate: 10
        })
    }
    updateGold(material)
    {
        let price = orePrices[material];
        this.gold += parseInt(price);
        if(this.goldText)
        {
            this.goldText.setText(this.gold.toFixed(1));
        }
    }
}

export default GameScene