import Enemy from "../enemy/Enemy";
import GameScene from "../GameScene";
import GroundLayer from "../map/GroundLayer";
import ItemLayer from "../map/ItemLayer";
import { Directions, States } from "./PlayerStateClasses";
import PlayerStateManager from "./PlayerStateManager";
import Explosion from "../items/Explosion";
import { GameObjects } from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    playerStateManager: PlayerStateManager
    playerHealth: GameObjects.Rectangle
    canClimb: boolean
    gold: number
    health: number
    maxHealth: number
    maxHealthWidth: number
    enemiesHit: Set<integer>
    explosions: Set<integer>
    canBeHit: boolean
    attackHitBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    scene: GameScene;
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, ItemLayer: ItemLayer)
    {
        super(scene, x, y, texture);
        this.scene = scene;
        this.setPipeline("Light2D");
        //Add Player to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);


        //Misc
        this.setMaxVelocity(250);
        this.playerStateManager = new PlayerStateManager(this, GroundLayer, ItemLayer);
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.canBeHit = true;
        this.enemiesHit = new Set<integer>();  
        this.explosions = new Set<integer>();
        this.gold = 20;  
        
        //Collision Logic
        scene.physics.add.collider(this, GroundLayer.layer);
        this.canClimb = false;
        scene.physics.add.overlap(this, ItemLayer.layer, ItemLayer.canClimb, undefined, this);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, scene.enemyGroup, this.handlePlayerDamage, undefined, this);
        this.setPushable(false);

        //Adjust body to map and spritesheet
        if(this.body)
        {
            this.setScale(1.3,1.3);
            this.body.setSize(26,36);
            this.body.setOffset(12, 12);
        }
        else
        {
            console.error("No Body");
        }

        

        //Attack Logic
        this.attackHitBox = scene.add.rectangle(this.x, this.y, 16, 16, 0xffffff, 0) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        this.attackHitBox.setScale(1.3,1.3);
        scene.physics.add.existing(this.attackHitBox);
        this.attackHitBox.body.setAllowGravity(false);
        this.attackHitBox.body.enable = false; 
        scene.physics.add.overlap(this.attackHitBox, scene.enemyGroup, this.handleEnemyDamage, undefined, this);

        // #region Health Bar   
        const borderWidth = 2;
        this.maxHealthWidth = 200;
        const height = 20;
        const xPos = 120;
        const yPos = 25;
        const borderX = xPos - (this.maxHealthWidth+borderWidth) / 2;
        const borderY = yPos - (height+borderWidth) / 2;
        let healthBarBorder = scene.add.graphics();
        healthBarBorder.lineStyle(borderWidth, 0xffffff, 1);
        healthBarBorder.strokeRect(borderX, borderY, this.maxHealthWidth+borderWidth, height+borderWidth);
        this.playerHealth = scene.add.rectangle(xPos, yPos, this.maxHealthWidth, height, 0xff0000);
        //Keep it in the same position relative to the viewport
        healthBarBorder.scrollFactorX = 0;
        healthBarBorder.scrollFactorY = 0;
        this.playerHealth.scrollFactorX = 0;
        this.playerHealth.scrollFactorY = 0;
        // #endregion Health Bar
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        this.playerStateManager.update(cursors, lastKeyPressed);
    }

    handleEnemyDamage = (hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject) =>
    {
        if(enemy instanceof Enemy)
        {
            if(!this.enemiesHit.has(enemy.id))
            {
                enemy.handleDamage(5);
                let knockbackDirection = new Phaser.Math.Vector2(enemy.x - this.x, enemy.y - this.y).normalize();
                // Apply knockback to the enemy
                let knockbackForce = 50;
                let friction = 30;
                enemy.setVelocity(knockbackDirection.x * knockbackForce, knockbackDirection.y * knockbackForce);
                enemy.setAccelerationX(-knockbackDirection.x * friction);
            }
            this.enemiesHit.add(enemy.id);
        }
        else
        {
            console.error("Not of type Enemy");
        }
    }

    handlePlayerDamage = (player: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, assailant: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject) =>
    {
        if(assailant instanceof Enemy)
        {
            if(this.canBeHit)
            {
                this.takeDamage(assailant.attack);
                this.canBeHit = false;
                this.scene.time.addEvent({
                    callback: () => {
                        this.canBeHit = true;
                    },
                    callbackScope: this,
                    delay: 1000
                });
            }
        }
        else if(assailant instanceof Explosion)
        {
            if(!this.explosions.has(assailant.id))
            {
                this.takeDamage(assailant.attack);
            }
            this.explosions.add(assailant.id);
        }
        else 
        {
            console.error("Not of type Enemy");
        }
    }

    takeDamage = (damage: number) =>
    {
        this.changeHealth(-1*damage);
        this.playerStateManager.changeState(States.HURT, Directions.IDLE);
    }

    changeHealth(change: number)
    {
        let newHealth = this.health + change;
        if(newHealth < 0)
        {
            newHealth = 0;
        }
        else if(newHealth > this.maxHealth)
        {
            newHealth = this.maxHealth;
        }
        //Return false if no healing happened;
        if(change > 0 && newHealth == this.health)
        {
            return false;
        }
        //Change health and health bar
        this.health = newHealth;
        this.playerHealth.width = Math.max(this.maxHealthWidth * this.health / this.maxHealth,0);
        return true;
    }
}