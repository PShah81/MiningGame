import Phaser, { GameObjects } from 'phaser'
import PlayerStateManager from './player/PlayerStateManager';
import Slime from './enemy/Slime';
import Player from './player/Player';
import GroundLayer from './map/GroundLayer';
import ItemLayer from './map/ItemLayer';
import Enemy from './enemy/Enemy';
import Explosion from './items/Explosion';
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
    gold: integer
    goldText!: Phaser.GameObjects.Text
    playerHealth!: Phaser.GameObjects.Rectangle
    lastKeyPressed?: integer
    map!: Phaser.Tilemaps.Tilemap
    ItemLayer!: ItemLayer
    GroundLayer!: GroundLayer
    player!: Player
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    dynamiteColliderGroup!: Phaser.Physics.Arcade.Group
    explosionOverlapGroup!: Phaser.Physics.Arcade.Group
    enemyGroup!: Phaser.Physics.Arcade.Group
    PlayerStateManager!: PlayerStateManager
    slime!: Slime
    constructor()
    {
        super('game-scene');
        this.gold = 0;
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
        this.load.spritesheet("hurt", '../assets/sprites/3 SteamMan/hurt.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("death", '../assets/sprites/3 SteamMan/death.png', { frameWidth: 48, frameHeight: 48});

        this.load.spritesheet("slime_idle", '../assets/sprites/Slime/slime_idle_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_walk", '../assets/sprites/Slime/slime_walk_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_death", '../assets/sprites/Slime/slime_death_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_attack", '../assets/sprites/Slime/slime_attack_spritesheet.png', { frameWidth: 32, frameHeight: 24});
        this.load.spritesheet("slime_jump", '../assets/sprites/Slime/slime_jump_spritesheet.png', { frameWidth: 16, frameHeight: 16});

    }

    create ()
    {
        this.add.image(400,300, 'sky');

        // Background that shows after a block has been mined
        let underground = this.add.image(0,500, 'underground');
        underground.setOrigin(0,0)
        underground.setDisplaySize(this.game.canvas.width, this.game.canvas.height - 500)

        // Create Animations
        this.createPlayerAnimations();
        this.createEnemyAnimations();

        // Collider Group
        this.dynamiteColliderGroup = this.physics.add.group({
            defaultKey: 'dynamite',
            collideWorldBounds: true
        })

        this.explosionOverlapGroup = this.physics.add.group({
            defaultKey: 'explosion',
            collideWorldBounds: true
        })

        this.enemyGroup = this.physics.add.group({
            collideWorldBounds: true
        })

        // #region Map

        this.map = this.make.tilemap({ width: 25, height: 200, tileWidth: 16, tileHeight: 16});

        let itemTileset = this.map.addTilesetImage('items', undefined, 16, 16);
        if(itemTileset)
        {
            let itemLayer = this.map.createBlankLayer('itemLayer', itemTileset);
            if(itemLayer)
            {
                this.ItemLayer = new ItemLayer(this, itemLayer, 0, 500);
            }
            else
            {
                console.error("itemLayer does not exist");
            }
        }
        else
        {
            console.error("Failed to load the tileset image");
        }
       
        let groundTileset = this.map.addTilesetImage('tiles', undefined, 16, 16);
        if(groundTileset)
        {
            let groundLayer = this.map.createBlankLayer('groundLayer', groundTileset);
            if(groundLayer)
            {
                this.GroundLayer = new GroundLayer(this, groundLayer, 0, 500);
            }
            else
            {
                console.error("groundLayer does not exist");
            }
        }
        else
        {
            console.error("Failed to load the tileset image");
        }
        // #endregion Map

        // #region Gold Bar
        // Gold Bar text
        this.goldText = this.add.text(64, 50, String(this.gold.toFixed(1)), {
            fontSize: '24px'
        });
        this.goldText.setOrigin(1, 0);
        //Keep it in the same position relative to the viewport
        this.goldText.scrollFactorX = 0
        this.goldText.scrollFactorY = 0

        //Gold Bar image
        let goldImage = this.add.image(96, 49, 'goldImage');
        goldImage.setOrigin(1,0);
        goldImage.setScale(1.5,1.5);
        goldImage.scrollFactorX = 0;
        goldImage.scrollFactorY = 0;

        // #endregion Gold Bar
        
        

        // Sprites
        this.player = new Player(this, 400, 300, "idle", this.GroundLayer, this.ItemLayer);
        this.slime = new Slime(this, 500, 300, "slime_idle", this.GroundLayer, this.player);
    
        // Collision 
        this.physics.add.collider(this.dynamiteColliderGroup, this.GroundLayer.layer);
        this.physics.add.overlap(this.explosionOverlapGroup, this.GroundLayer.layer, this.GroundLayer.removeGround, undefined, this);
        this.physics.add.overlap(this.explosionOverlapGroup, this.ItemLayer.layer, this.ItemLayer.itemsExploded, undefined, this);
        this.physics.add.overlap(this.player, this.explosionOverlapGroup, this.player.handlePlayerDamage, undefined, this);
        this.physics.add.overlap(this.enemyGroup, this.explosionOverlapGroup, this.handleExplosionDamage, undefined, this);

        // Input Events
        if(this.input.keyboard)
        {
            this.cursors = this.input.keyboard.createCursorKeys();
            //Adding key presses
            this.input.keyboard.on('keydown', this.handleKeyPress, this);
        }

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.height = 1000;


    }

    update () 
    {
        this.player.update(this.cursors, this.lastKeyPressed);
        this.slime.update();
        // Reset the lastKeyPressed after processing
        this.lastKeyPressed = undefined;
    }

    handleExplosionDamage(enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, explosion: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(explosion instanceof Explosion)
        {
            explosion.handleDamage(enemy, explosion);
        }
    }

    handleKeyPress(event: KeyboardEvent)
    {
        this.lastKeyPressed = event.keyCode
    }

    createPlayerAnimations()
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
        this.anims.create({
            key: "hurt",
            frames: this.anims.generateFrameNumbers('hurt', { start: 0, end: 2}),
            frameRate: 10
        })
        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNumbers('death', { start: 0, end: 5}),
            frameRate: 5
        })
    }
    
    createEnemyAnimations()
    {
        this.anims.create({
            key: 'slime_idle',
            frames: this.anims.generateFrameNumbers('slime_idle', { start: 0, end: 4 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'slime_walk',
            frames: this.anims.generateFrameNumbers('slime_walk', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'slime_attack',
            frames: this.anims.generateFrameNumbers('slime_attack', { start: 0, end: 4}),
            frameRate: 10
        });
        this.anims.create({
            key: 'slime_death',
            frames: this.anims.generateFrameNumbers('slime_death', { start: 0, end: 4}),
            frameRate: 10
        });
        this.anims.create({
            key: 'slime_jump',
            frames: this.anims.generateFrameNumbers('slime_jump', { start: 0, end: 2}),
            frameRate: 30
        });
        this.anims.create({
            key: 'slime_fall',
            frames: this.anims.generateFrameNumbers('slime_jump', { start: 3, end: 6}),
            frameRate: 30
        });
        this.anims.create({
            key: 'slime_land',
            frames: this.anims.generateFrameNumbers('slime_jump', { start: 7, end: 9}),
            frameRate: 15
        });
        
    }

    updateGold(material: string)
    {
        let price = orePrices[material as keyof typeof orePrices];
        this.gold += price;
        console.log(this.gold)
        this.goldText.setText(this.gold.toFixed(1));
    }
    
}

export default GameScene