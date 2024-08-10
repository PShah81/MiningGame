import GroundLayer from "../map/GroundLayer.ts";
import GameScene from "../GameScene.ts";
import Enemy from "./Enemy.ts";
import ReaperStateManager from "./ReaperStateManager.ts";
import Player from "../player/Player.ts";
import InvisibleLayer from "../map/InvisibleLayer.ts";

export default class Reaper extends Enemy
{
    reaperStateManager: ReaperStateManager
    InvisibleLayer: InvisibleLayer
    spiritArr: Phaser.GameObjects.Sprite[]
    attackHitBox!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody 
    attack: number
    attacked: boolean
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, player: Player)
    {
        super(scene, x, y, texture, GroundLayer, true);
        this.attack = 10;
        this.attacked = false;
        //Adjust body and sprite to map and spritesheet
        if(this.body)
        {
            this.setSize(48,60);
            this.setScale(1.5,1.5);
        }
        else
        {
            console.log("No Body??");
        }
        this.InvisibleLayer = scene.InvisibleLayer;
        this.reaperStateManager = new ReaperStateManager(this, player);
        if(this.body instanceof Phaser.Physics.Arcade.Body)
        {
            this.body.setAllowGravity(false);
        }
        else
        {
            console.error("Reaper has no body");
        }
        this.spiritArr = [];
        this.spiritArr.push(this.scene.add.sprite(this.x, this.y - 40, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x, this.y - 40, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x, this.y - 40, "spirit_summon"));
        this.spiritArr.push(this.scene.add.sprite(this.x, this.y - 40, "spirit_summon"));
        for (let spirit of this.spiritArr)
        {
            spirit.anims.play("spirit_idle", true);
        }

        this.attackHitBox = scene.add.rectangle(this.x, this.y, 110, 90, 0xffffff, 0) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
        scene.physics.add.existing(this.attackHitBox);
        this.attackHitBox.body.setAllowGravity(false);
        this.attackHitBox.body.enable = false; 
        scene.physics.add.overlap(this.attackHitBox, player, this.giveDamage, undefined, this);
    }

    update()
    {
        this.reaperStateManager.update();
        let tile = this.InvisibleLayer.getTileAtObject(this);
        if(tile)
        {
            this.setVisible(false);
        }
        else
        {
            this.setVisible(true);
        }
    }

    giveDamage(hitbox: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject, player: Phaser.Tilemaps.Tile | Phaser.GameObjects.GameObject)
    {
        if(player instanceof Player && this.attacked == false)
        {
            this.attacked = true;
            player.handlePlayerDamage(player, this);
        }
    }
    
    takeDamage()
    {

    }
}