import Reaper from "../enemy/Reaper.ts"
import Enemy from "../enemy/Enemy.ts"
import GameScene from "../GameScene.ts"

export default class Explosion extends Phaser.Physics.Arcade.Sprite
{
    static currentId: integer = 0
    id: integer
    attack: number
    enemiesHit: Set<integer>
    constructor(scene: GameScene, x:integer, y: integer, texture: string)
    {
        super(scene, x, y, texture);
        
        this.enemiesHit = new Set<integer>();

        //Add Explosion to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this); 

        //Deals damage to everything
        this.attack = 10;
        this.id = Explosion.currentId;
        Explosion.currentId += 1;
        
        scene.explosionOverlapGroup.add(this);
        if(this.body && this.body instanceof Phaser.Physics.Arcade.Body)
        {
            this.body.setAllowGravity(false);
            this.body.setVelocityY(0);
        }
        else
        {
            console.error("Explosion has no body");
        }
        this.setScale(3.5,3.5);
        this.anims.play("explosion", true);
        this.on('animationcomplete-explosion', () => {
            this.destroy()
        });
        
    }

    handleDamage(enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, explosion: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(enemy instanceof Enemy && !(enemy instanceof Reaper))
        {
            if(!this.enemiesHit.has(enemy.id))
            {
                enemy.handleDamage(10);
                let knockbackDirection = new Phaser.Math.Vector2(enemy.x - this.x, enemy.y - this.y).normalize();
                // Apply knockback to the enemy
                let knockbackForce = 130;
                let friction = 30;
                enemy.setVelocity(knockbackDirection.x * knockbackForce, knockbackDirection.y * knockbackForce);
                enemy.setAccelerationX(-knockbackDirection.x * friction);
            }
            this.enemiesHit.add(enemy.id);
        }
        else if(enemy instanceof Reaper)
        {
            if(!this.enemiesHit.has(enemy.id))
            {
                enemy.handleDamage(10);
            }
            this.enemiesHit.add(enemy.id);
        }
        else
        {
            console.error("Not of type Enemy");
        }
    }
}