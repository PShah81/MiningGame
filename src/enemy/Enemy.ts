import GroundLayer from "~/map/GroundLayer";
import GameScene from "../GameScene";

export default class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer)
    {
        super(scene, x, y, texture);

        //Add Enemy to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        //Collision Logic
        scene.physics.add.collider(this, GroundLayer.layer);
        if(scene.enemyGroup)
        {
            scene.enemyGroup.add(this);
        }
        else
        {
            console.error("No Enemy Group");
        }
        
    }

    update()
    {
        
    }

    handleDamage(hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        console.log("hey");
    }
}