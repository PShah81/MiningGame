import GameScene from "../GameScene";
import Explosion from "./Explosion";

export default class Dynamite extends Phaser.Physics.Arcade.Sprite
{
    static currentId: integer = 0
    id: integer
    constructor(scene: GameScene, x:integer, y: integer, texture: string)
    {
        super(scene, x, y, texture);
        
        //Add Explosion to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.id = Dynamite.currentId;
        Dynamite.currentId+=1;
        
        scene.dynamiteColliderGroup.add(this);
        
        this.setScale(1.2,1.2);
        this.anims.play("dynamite", true);
        this.on('animationcomplete-dynamite', () => {
            this.destroy();
            new Explosion(scene, this.x, this.y, "explosion");
        });
        
    }
}