import Enemy from "../enemy/Enemy";
import GameScene from "../GameScene";
import GroundLayer from "../map/GroundLayer";
import ItemLayer from "../map/ItemLayer";
import { Directions, States } from "./PlayerStateClasses";
import PlayerStateManager from "./PlayerStateManager";

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    playerStateManager: PlayerStateManager
    canClimb: boolean
    health: number
    enemiesHit: Set<integer>
    canBeHit: boolean
    attackHitBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, ItemLayer: ItemLayer)
    {
        super(scene, x, y, texture);
        
        //Add Player to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);


        //Misc
        this.setMaxVelocity(250);
        this.playerStateManager = new PlayerStateManager(this, GroundLayer, ItemLayer);
        this.health = 20;
        this.canBeHit = true;
        this.enemiesHit = new Set<integer>();  
        
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
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        this.playerStateManager.update(cursors, lastKeyPressed);
    }

    handleEnemyDamage(hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(enemy instanceof Enemy)
        {
            if(!this.enemiesHit.has(enemy.id))
            {
                enemy.handleDamage(5);
            }
            this.enemiesHit.add(enemy.id);
        }
        else
        {
            console.error("Not of type Enemy");
        }
    }

    handlePlayerDamage(player: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(enemy instanceof Enemy)
        {
            if(this.canBeHit)
            {
                this.health -= enemy.attack;
                this.playerStateManager.changeState(States.HURT, Directions.IDLE);
                console.log(this.health);
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
        else
        {
            console.error("Not of type Enemy");
        }
    }
}