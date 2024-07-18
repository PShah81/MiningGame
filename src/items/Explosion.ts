import GameScene from "../GameScene"

export default class Explosion extends Phaser.Physics.Arcade.Sprite
{
    static currentId: integer = 0
    id: integer
    attack: number
    constructor(scene: GameScene, x:integer, y: integer, texture: string)
    {
        super(scene, x, y, texture);
        
        //Add Explosion to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //Deals damage to everything
        this.attack = 10;
        this.id = Explosion.currentId;
        Explosion.currentId+=1;
        
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
}