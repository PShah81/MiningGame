import GroundLayer from "~/map/GroundLayer";
import GameScene from "../GameScene";
import Enemy from "./Enemy";

export default class Slime extends Enemy
{
    constructor(scene: GameScene, x:integer, y: integer, texture: string, GroundLayer: GroundLayer)
    {
        super(scene, x, y, texture, GroundLayer);

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