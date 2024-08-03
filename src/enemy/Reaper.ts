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
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, player: Player)
    {
        super(scene, x, y, texture, GroundLayer);
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
}