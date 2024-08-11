import GroundLayer from "../map/GroundLayer.ts";
import GameScene from "../GameScene.ts";
import Enemy from "./Enemy.ts";
import ReaperStateManager from "./ReaperStateManager.ts";
import Player from "../player/Player.ts";
import InvisibleLayer from "../map/InvisibleLayer.ts";
import { States } from "./ReaperStateClasses.ts";

export default class Reaper extends Enemy
{
    reaperStateManager: ReaperStateManager
    InvisibleLayer: InvisibleLayer
    spiritArr: Phaser.GameObjects.Sprite[]
    attackHitBox!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody 
    attack: number
    attacked: boolean
    vulnerable: boolean
    health: number
    maxHealth: number
    maxHealthWidth: number
    reaperHealth: Phaser.GameObjects.Rectangle
    healthBarBorder: Phaser.GameObjects.Graphics
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, player: Player)
    {
        super(scene, x, y, texture, GroundLayer, true);
        this.attack = 20;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.attacked = false;
        this.vulnerable = false;
        //Adjust body and sprite to map and spritesheet
        if(this.body)
        {
            this.setSize(48,60);
            this.setScale(1.5,1.5);
        }
        else
        {
            console.log("No Body??");
        }
        this.InvisibleLayer = scene.InvisibleLayer;
        this.reaperStateManager = new ReaperStateManager(this, player);
        if(this.body instanceof Phaser.Physics.Arcade.Body)
        {
            this.body.setAllowGravity(false);
        }
        else
        {
            console.error("Reaper has no body");
        }
        this.spiritArr = [];
        let distance = 30;
        this.spiritArr.push(this.scene.add.sprite(this.x + distance, this.y - distance, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x + distance, this.y + distance, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x - distance, this.y - distance, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x - distance, this.y + distance, "spirit_summon"));
        for (let spirit of this.spiritArr)
        {
            spirit.setVisible(false);
            spirit.anims.play("spirit_idle", true);
        }


        // Hitbox
        this.attackHitBox = scene.add.rectangle(this.x, this.y, 110, 90, 0xffffff, 0) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        scene.physics.add.existing(this.attackHitBox);
        this.attackHitBox.body.setAllowGravity(false);
        this.attackHitBox.body.enable = false; 
        scene.physics.add.overlap(this.attackHitBox, player, this.giveDamage, undefined, this);


        //Health Bar
        const borderWidth = 2;
        this.maxHealthWidth = 400;
        const height = 20;
        const xPos = window.innerWidth - 225;
        const yPos = 25;
        const borderX = xPos - (this.maxHealthWidth+borderWidth) / 2;
        const borderY = yPos - (height+borderWidth) / 2;
        this.healthBarBorder = scene.add.graphics();
        this.healthBarBorder.lineStyle(borderWidth, 0xffffff, 1);
        this. healthBarBorder.strokeRect(borderX, borderY, this.maxHealthWidth+borderWidth, height+borderWidth);
        this.reaperHealth = scene.add.rectangle(xPos, yPos, this.maxHealthWidth, height, 0xff0000);
        //Keep it in the same position relative to the viewport
        this.healthBarBorder.scrollFactorX = 0;
        this.healthBarBorder.scrollFactorY = 0;
        this.reaperHealth.scrollFactorX = 0;
        this.reaperHealth.scrollFactorY = 0;
        this.reaperHealth.setVisible(false);
        this.healthBarBorder.setVisible(false);
    }

    update()
    {
        this.reaperStateManager.update();
        let tile = this.InvisibleLayer.getTileAtObject(this);
        if(tile)
        {
            this.setVisible(false);
        }
        else
        {
            this.setVisible(true);
        }
    }

    giveDamage(hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, player: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(player instanceof Player && this.attacked == false)
        {
            this.attacked = true;
            player.handlePlayerDamage(player, this);
        }
    }
    
    handleDamage(damage: number)
    {
        if(this.vulnerable)
        {
            this.changeHealth(-1*damage);
            if(this.health <= 0)
            {
                this.reaperStateManager.changeState(States.DEATH);
            }
        }
        
    }


    changeHealth(change: number)
    {
        //If in intro do not allow damage to be taken
        let newHealth = this.health + change;
        if(newHealth <= 0)
        {
            newHealth = 0;
        }
        //Change health and health bar
        this.health = newHealth;
        this.reaperHealth.width = Math.max(this.maxHealthWidth * this.health / this.maxHealth,0);
        
    }
}