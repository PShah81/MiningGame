import GroundLayer from "~/map/GroundLayer";
import GameScene from "../GameScene";
import Enemy from "./Enemy";
import SlimeStateManager from "./SlimeStateManager";
import Player from "../player/Player";

export default class Slime extends Enemy
{
    slimeStateManager: SlimeStateManager
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer, player: Player)
    {
        super(scene, x, y, texture, GroundLayer);
        //Adjust body and sprite to map and spritesheet
        if(this.body)
        {
            this.setSize(14,12);
            this.setOffset(0,4);
            this.setScale(1.5,1.5);
        }
        else
        {
            console.log("No Body??");
        }

        this.slimeStateManager = new SlimeStateManager(this, player);
    }

    update()
    {
        this.slimeStateManager.update();
    }
}