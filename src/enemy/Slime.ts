import GroundLayer from "../map/GroundLayer.ts";
import GameScene from "../GameScene.ts";
import Enemy from "./Enemy.ts";
import SlimeStateManager from "./SlimeStateManager.ts";
import Player from "../player/Player.ts";
import InvisibleLayer from "../map/InvisibleLayer.ts";
import { Directions, States } from "./SlimeStateClasses.ts";

export default class Slime extends Enemy
{
    slimeStateManager: SlimeStateManager
    InvisibleLayer: InvisibleLayer
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
        this.InvisibleLayer = scene.InvisibleLayer;
        this.slimeStateManager = new SlimeStateManager(this, player);
    }

    update()
    {
        this.slimeStateManager.update();
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

    handleDamage(damage: number) {
        this.health -= damage;
        if(this.health <= 0)
        {
            this.slimeStateManager.changeState(States.DEATH, Directions.IDLE);
        }
    }
}