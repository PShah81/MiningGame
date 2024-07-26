import Phaser from 'phaser'
import Slime from './enemy/Slime.ts';
import Player from './player/Player.ts';
import GroundLayer from './map/GroundLayer.ts';
import ItemLayer from './map/ItemLayer.ts';
import Explosion from './items/Explosion.ts';
import InvisibleLayer from './map/InvisibleLayer.ts';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export default class GameScene extends Phaser.Scene
{
    goldText!: Phaser.GameObjects.Text
    playerHealth!: Phaser.GameObjects.Rectangle
    lastKeyPressed?: integer
    map!: Phaser.Tilemaps.Tilemap
    ItemLayer!: ItemLayer
    GroundLayer!: GroundLayer
    InvisibleLayer!: InvisibleLayer
    player!: Player
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    dynamiteColliderGroup!: Phaser.Physics.Arcade.Group
    explosionOverlapGroup!: Phaser.Physics.Arcade.Group
    enemyGroup!: Phaser.Physics.Arcade.Group
    landPos: number
    rexUI!: RexUIPlugin
    textIndex: number
    textArr: string[]
    textBox!: RexUIPlugin.TextBox
    dialog!: RexUIPlugin.Dialog
    intro: boolean
    tileOffset!: number
    tileOffsetPos!: number
    trueGameWidth!: number
    trueCenter!: number
    constructor()
    {
        super('GameScene');
        this.landPos = 500;
        this.textIndex = 0;
        this.textArr = ['Welcome, your goal is to reach the center of the planet and defeat the demon lord. Press Enter to continue.',
        'Use arrow keys to move around and mine and Space to attack.',
        'To place/use items, press the number corresponding to your item shown on the top left of the screen.',
        'You can only use torches and ladders underground, and you can remove them by pressing Q.',
        'If you ever forget the controls of the game or need to step away from the game, click P to pause.',
        'Good luck!'];
        this.intro = true;
    }

    preload ()
    {
        this.load.spritesheet('tiles', 'assets/sprites/ores.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('items', 'assets/sprites/Extras/items.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('invisible', 'assets/sprites/invisible.png',  {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('dynamite', 'assets/sprites/Extras/dynamite.png', {frameWidth: 22, frameHeight: 24});
        this.load.spritesheet('explosion', 'assets/sprites/Extras/explosion.png', {frameWidth: 32, frameHeight: 32})
        this.load.image('sky', 'assets/sprites/sky.png');
        this.load.image('underground', 'assets/sprites/background.png');
        this.load.image('goldImage', 'assets/sprites/gold.png');
        this.load.image('potion', 'assets/sprites/health_potion.png');
        this.load.spritesheet("mine", 'assets/sprites/3 SteamMan/mine.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("walk", 'assets/sprites/3 SteamMan/walk.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("idle", 'assets/sprites/3 SteamMan/idle.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("jump", 'assets/sprites/3 SteamMan/jump.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("run", 'assets/sprites/3 SteamMan/run.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("climb", 'assets/sprites/3 SteamMan/climb.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("attack", 'assets/sprites/3 SteamMan/attack.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("hurt", 'assets/sprites/3 SteamMan/hurt.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet("death", 'assets/sprites/3 SteamMan/death.png', { frameWidth: 48, frameHeight: 48});

        this.load.spritesheet("slime_idle", 'assets/sprites/Slime/slime_idle_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_walk", 'assets/sprites/Slime/slime_walk_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_death", 'assets/sprites/Slime/slime_death_spritesheet.png', { frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("slime_attack", 'assets/sprites/Slime/slime_attack_spritesheet.png', { frameWidth: 32, frameHeight: 24});
        this.load.spritesheet("slime_jump", 'assets/sprites/Slime/slime_jump_spritesheet.png', { frameWidth: 16, frameHeight: 16});

    }

    create ()
    {
        // Create measurement fields
        this.tileOffset = Math.ceil(this.cameras.main.width/(48*2));
        this.tileOffsetPos = -48*this.tileOffset;
        this.trueGameWidth = 48 * 2 * this.tileOffset + this.game.canvas.width;
        this.trueCenter = this.trueGameWidth/2 + this.tileOffsetPos;

        //Background Images
        let sky = this.add.image(this.trueCenter, this.landPos, 'sky');
        sky.setOrigin(0.5,1);
        sky.setDisplaySize(this.trueGameWidth, 750);
        let underground = this.add.image(this.trueCenter, this.landPos, 'underground').setPipeline("Light2D");
        underground.setOrigin(0.5,0);
        underground.setDisplaySize(this.trueGameWidth, this.game.canvas.height - this.landPos);

        // Create Animations
        this.createPlayerAnimations();
        this.createEnemyAnimations();

        // #region Collider Group
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

        // #endregion Collider Group

        // Map
        this.initializeMap();
        
        // Sprites
        this.player = new Player(this, this.trueCenter, this.landPos - 40, "idle", this.GroundLayer, this.ItemLayer);
        let caves = this.GroundLayer.findCaves(10);
        this.spawnMobs(caves);
        
        //Draw items, gold and tutorial on screen
        this.drawOnScreen();

        // Collision 
        this.physics.add.collider(this.dynamiteColliderGroup, this.GroundLayer.layer);
        this.physics.add.overlap(this.explosionOverlapGroup, this.GroundLayer.layer, this.GroundLayer.groundExploded, undefined, this);
        this.physics.add.overlap(this.explosionOverlapGroup, this.ItemLayer.layer, this.ItemLayer.itemsExploded, undefined, this);
        this.physics.add.overlap(this.player, this.explosionOverlapGroup, this.player.handlePlayerDamage, undefined, this);
        this.physics.add.overlap(this.enemyGroup, this.explosionOverlapGroup, this.handleExplosionDamage, undefined, this);

        // Input Events
        if(this.input.keyboard)
        {
            this.cursors = this.input.keyboard.createCursorKeys();
            //Adding key presses
            this.input.keyboard.on('keydown', this.handleKeyPress, this);
            this.input.keyboard.on('keydown-ENTER', this.updateText, this);
            this.input.keyboard.on('keydown-P', this.pauseGame, this);
        }

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.height = window.innerHeight;
        this.cameras.main.width = window.innerWidth;

        // Lights
        this.lights.enable().setAmbientColor(0x111111);
        //Imitate the sun
        this.lights.addLight(this.game.canvas.width / 2, 0, this.trueGameWidth).setIntensity(10);
    }

    update () 
    {
        this.player.update(this.cursors, this.lastKeyPressed);
        for (let child of this.enemyGroup.children.entries)
        {
            child.update();
        }
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
    
    updateGold(price: number)
    {
        //If in intro all purchases are free
        if(!this.intro)
        {
            this.player.gold += price;
            this.goldText.setText(this.player.gold.toFixed(1));
        }

    }
    
    createBorder(image: Phaser.GameObjects.Image, borderWidth: number)
    {
        let imageX = image.x;
        let imageY = image.y;
        let imageWidth = image.width;
        let imageHeight = image.height;
        let border = this.add.graphics();
        const borderX = imageX - (imageWidth+borderWidth) / 2;
        const borderY = imageY - (imageHeight+borderWidth) / 2;
        border.lineStyle(borderWidth, 0x000000, 1);
        border.strokeRect(borderX, borderY, imageWidth+borderWidth, imageHeight+borderWidth);
        border.scrollFactorX = 0;
        border.scrollFactorY = 0;
        return border;
    }

    spawnMobs(caves: number[][][])
    {
        console.log(caves);
        for(let cave of caves)
        {
            let spawnPoint = cave.pop();
            if(spawnPoint)
            {
                let [tileX,tileY] = spawnPoint;
                let worldVec = this.GroundLayer.layer.tileToWorldXY(tileX, tileY);
                // Centers slime on the tile
                let slime = new Slime(this, worldVec.x + this.GroundLayer.layer.tilemap.tileWidth, worldVec.y + this.GroundLayer.layer.tilemap.tileHeight, "slime_idle", this.GroundLayer, this.player);
                this.enemyGroup.add(slime);
            }
        }
    }

    handleInitialDialog()
    {
        this.dialog = this.rexUI.add.dialog({
            x: this.game.canvas.width/2,
            y: 200,
            width: 550,
            height: 100,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xffffff),
            content: this.textBox
        }).layout();

        this.textBox = this.rexUI.add.textBox({
            x: this.game.canvas.width/2,
            y: this.dialog.y - this.dialog.height/4,
            width: 550,
            height: 50,
            text: this.add.text(0, 0, this.textArr[this.textIndex], {
              fontSize: '24px',
              fontFamily: 'Open Sans',
              color: '#000',
              wordWrap: {width: 550, useAdvancedWrap: true}
            }),
            space: {
              left: 30,
              right: 30,
              top: 60,
              bottom: 20
            }
        }).layout();


        // Initial text update
        this.updateText();
    }

    updateText()
    {
        if(this.textIndex < this.textArr.length) {
            this.textBox.setText(this.textArr[this.textIndex]);
            this.textIndex++;
        } 
        else {
            this.dialog.setVisible(false); // Close the dialog when no text is left
            this.textBox.setText("");
            this.intro = false;
        }
    };

    pauseGame()
    {
        this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    drawOnScreen()
    {
        // #region Drawing on Screen
        // #region Purchasable Items
        let ladderBackground = this.add.rectangle(300, 25, 32, 32, 0xbbbdb9);
        ladderBackground.scrollFactorX = 0;
        ladderBackground.scrollFactorY = 0;

        let ladderImage = this.add.image(300, 25, "items", 0);
        ladderImage.setSize(32,32);
        ladderImage.setScale(1.8,1.8);
        ladderImage.scrollFactorX = 0;
        ladderImage.scrollFactorY = 0;
        let ladderBorder = this.createBorder(ladderImage, 2);
        let ladderKey = this.add.text(295, 50, "1", {
            fontSize: '20px'
        });
        ladderKey.scrollFactorX = 0;
        ladderKey.scrollFactorY = 0;
        let ladderCost = this.add.text(270, 75, "0.5", {
            fontSize: '14px'
        });
        ladderCost.scrollFactorX = 0;
        ladderCost.scrollFactorY = 0;
        let ladderGold = this.add.image(310, 82, 'goldImage');
        ladderGold.setScale(0.8,0.8);
        ladderGold.scrollFactorX = 0;
        ladderGold.scrollFactorY = 0;
        


        let torchBackground = this.add.rectangle(350, 25, 32, 32, 0xbbbdb9);
        torchBackground.scrollFactorX = 0;
        torchBackground.scrollFactorY = 0;

        let torchImage = this.add.image(350, 25, "items", 1);
        torchImage.setSize(32,32);
        torchImage.setScale(2.5,2.5);
        torchImage.scrollFactorX = 0;
        torchImage.scrollFactorY = 0;
        let torchBorder = this.createBorder(torchImage, 2);
        let torchKey = this.add.text(345, 50, "2", {
            fontSize: '20px'
        });
        torchKey.scrollFactorX = 0;
        torchKey.scrollFactorY = 0;
        let torchCost = this.add.text(340, 75, "1", {
            fontSize: '14px'
        });
        torchCost.scrollFactorX = 0;
        torchCost.scrollFactorY = 0;
        let torchGold = this.add.image(360, 82, 'goldImage');
        torchGold.setScale(0.8,0.8);
        torchGold.scrollFactorX = 0;
        torchGold.scrollFactorY = 0;
        

        let dynamiteBackground = this.add.rectangle(400, 25, 32, 32, 0xbbbdb9);
        dynamiteBackground.scrollFactorX = 0;
        dynamiteBackground.scrollFactorY = 0;

        let dynamiteImage = this.add.image(400, 25, "dynamite", 0);
        dynamiteImage.setSize(32,32);
        dynamiteImage.scrollFactorX = 0;
        dynamiteImage.scrollFactorY = 0;
        let dynamiteBorder = this.createBorder(dynamiteImage, 2);
        let dynamiteKey = this.add.text(395, 50, "3", {
            fontSize: '20px'
        });
        dynamiteKey.scrollFactorX = 0;
        dynamiteKey.scrollFactorY = 0;
        let dynamiteCost = this.add.text(390, 75, "2", {
            fontSize: '14px'
        });
        dynamiteCost.scrollFactorX = 0;
        dynamiteCost.scrollFactorY = 0;
        let dynamiteGold = this.add.image(410, 82, 'goldImage');
        dynamiteGold.setScale(0.8,0.8);
        dynamiteGold.scrollFactorX = 0;
        dynamiteGold.scrollFactorY = 0;


        let potionBackground = this.add.rectangle(450, 25, 32, 32, 0xbbbdb9);
        potionBackground.scrollFactorX = 0;
        potionBackground.scrollFactorY = 0;

        let potionImage = this.add.image(450, 25, "potion", 0);
        potionImage.setSize(32,32);
        potionImage.setScale(1.5,1.5);
        potionImage.scrollFactorX = 0;
        potionImage.scrollFactorY = 0;
        let potionBorder = this.createBorder(potionImage, 2);
        let potionKey = this.add.text(445, 50, "4", {
            fontSize: '20px'
        });
        potionKey.scrollFactorX = 0;
        potionKey.scrollFactorY = 0;
        let potionCost = this.add.text(440, 75, "5", {
            fontSize: '14px'
        });
        potionCost.scrollFactorX = 0;
        potionCost.scrollFactorY = 0;
        let potionGold = this.add.image(460, 82, 'goldImage');
        potionGold.setScale(0.8,0.8);
        potionGold.scrollFactorX = 0;
        potionGold.scrollFactorY = 0;
        // #endregion Purchasable Items

        // #region Gold Bar
        // Gold Bar text
        this.goldText = this.add.text(100, 50, String(this.player.gold.toFixed(1)), {
            fontSize: '24px'
        });
        this.goldText.setOrigin(1, 0);
        //Keep it in the same position relative to the viewport
        this.goldText.scrollFactorX = 0
        this.goldText.scrollFactorY = 0

        //Gold Bar image
        let goldImage = this.add.image(120, 60, 'goldImage');
        goldImage.setScale(1.5,1.5);
        goldImage.scrollFactorX = 0;
        goldImage.scrollFactorY = 0;

        // #endregion Gold Bar
        this.handleInitialDialog();
        // #endregion Drawing on Screen
    }

    initializeMap()
    {
        // World barrier
        var graphics = this.add.graphics();
        var outlineThickness = 1;
        var outlineColor = 0xff0000;  // Red color for the outline

        graphics.lineStyle(outlineThickness, outlineColor, 1);
        graphics.beginPath();
        graphics.moveTo(0, -150);
        graphics.lineTo(0, this.game.canvas.height);
        graphics.moveTo(this.game.canvas.width, -150);
        graphics.lineTo(this.game.canvas.width, this.game.canvas.height);
        graphics.strokePath();

        this.map = this.make.tilemap({ width: this.trueGameWidth / 48, height: this.game.canvas.height / 48, tileWidth: 16, tileHeight: 16});

        let itemTileset = this.map.addTilesetImage('items', undefined, 16, 16);
        if(itemTileset)
        {
            let itemLayer = this.map.createBlankLayer('itemLayer', itemTileset);
            if(itemLayer)
            {
                this.ItemLayer = new ItemLayer(this, itemLayer, this.tileOffsetPos, this.landPos);
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
                this.GroundLayer = new GroundLayer(this, groundLayer, this.tileOffsetPos, this.landPos);
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
        let invisibleTileset = this.map.addTilesetImage('invisible', undefined, 16, 16);
        if(invisibleTileset)
        {
            let invisibleLayer = this.map.createBlankLayer('darknessLayer', invisibleTileset);
            if(invisibleLayer)
            {
                this.InvisibleLayer = new InvisibleLayer(this, invisibleLayer, this.tileOffsetPos, this.landPos);
            }
            else
            {
                console.error("darknessLayer does not exist");
            }
        }
        else
        {
            console.error("Failed to load the tileset image");
        }
    }

    gameOver()
    {
        this.scene.launch('GameOverScene');
    }
}