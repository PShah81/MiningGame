import GameScene from "../GameScene";
import GroundLayer from "../map/GroundLayer";
import ItemLayer from "../map/ItemLayer";
import PlayerStateManager from "./PlayerStateManager";

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    playerStateManager?: PlayerStateManager
    canClimb: boolean
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, ItemLayer: ItemLayer)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        if(this.body)
        {
            this.body.setSize(26,36);
            this.body.setOffset(12, 12);
        }
        else
        {
            console.log("No Body??");
        }
        this.setMaxVelocity(250);
        this.setCollideWorldBounds(true);
        this.canClimb = false;
        this.playerStateManager = new PlayerStateManager(this, GroundLayer, ItemLayer)
    }

    update(cursors, lastKeyPressed)
    {
        if(this.playerStateManager)
        {
            this.playerStateManager.update(cursors, lastKeyPressed)
        }
        else
        {
            console.log("No State Manager");
        }
    }
}