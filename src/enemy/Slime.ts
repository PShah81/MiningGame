import GroundLayer from "~/map/GroundLayer";
import GameScene from "../GameScene";

export default class Slime extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer)
    {
        super(scene, x, y, texture);

        //Add Slime to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        //Collision Logic
        scene.physics.add.collider(this, GroundLayer.layer);
        
        //Adjust body and sprite to map and spritesheet
        if(this.body)
        {
            this.setScale(1.5,1.5)
        }
        else
        {
            console.log("No Body??");
        }
    }

    update()
    {
        
    }
}