import Enemy from "../enemy/Enemy";
import GameScene from "../GameScene";
import GroundLayer from "../map/GroundLayer";
import ItemLayer from "../map/ItemLayer";
import PlayerStateManager from "./PlayerStateManager";

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    playerStateManager: PlayerStateManager
    canClimb: boolean
    attackHitBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, ItemLayer: ItemLayer)
    {
        super(scene, x, y, texture);
        
        //Add Player to Game Scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //Collision Logic
        scene.physics.add.collider(this, GroundLayer.layer);
        this.canClimb = false;
        scene.physics.add.overlap(this, ItemLayer.layer, ItemLayer.canClimb, undefined, this);
        this.setCollideWorldBounds(true);

        //Adjust body to map and spritesheet
        if(this.body)
        {
            this.body.setSize(26,36);
            this.body.setOffset(12, 12);
        }
        else
        {
            console.error("No Body");
        }

        //Misc
        this.setMaxVelocity(250);
        this.playerStateManager = new PlayerStateManager(this, GroundLayer, ItemLayer);

        //Attack Logic
        this.attackHitBox = scene.add.rectangle(this.x, this.y, 16, 16, 0xffffff, 0) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        scene.physics.add.existing(this.attackHitBox);
        this.attackHitBox.body.setAllowGravity(false);
        this.attackHitBox.body.enable = false;
        scene.physics.add.overlap(this.attackHitBox, scene.enemyGroup, this.handleDamage, undefined, this);     
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        this.playerStateManager.update(cursors, lastKeyPressed);
    }

    handleDamage(hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, enemy: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(enemy instanceof Enemy)
        {
            console.log(enemy);
        }
        else
        {
            console.error("Not of type Enemy");
        }
    }
}