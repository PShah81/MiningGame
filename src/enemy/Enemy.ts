import GroundLayer from "~/map/GroundLayer";
import GameScene from "../GameScene";

export default class Enemy extends Phaser.Physics.Arcade.Sprite
{
    static currentId: integer = 0
    health: number
    id: integer
    attack: number
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer)
    {
        super(scene, x, y, texture);
        this.setPipeline("Light2D");
        this.health = 10;
        this.attack = 5;
        this.id = Enemy.currentId;
        Enemy.currentId += 1;
        //Add Enemy to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        //Collision Logic
        scene.physics.add.collider(this, GroundLayer.layer);
        this.setPushable(false);
        scene.enemyGroup.add(this);
        
    }

    update()
    {
        
    }

    handleDamage(damage: number)
    {
        this.health -= damage;
        console.log(this.health);
    }
}