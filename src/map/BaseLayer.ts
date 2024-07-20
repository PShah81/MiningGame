import Dynamite from "../items/Dynamite";
import GameScene from "../GameScene";
import GroundLayer from "./GroundLayer";

export default class BaseLayer
{
    scene: GameScene
    layer: Phaser.Tilemaps.TilemapLayer
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        this.layer = layer;
        this.scene = scene;
        this.layer.x = x;
        this.layer.y = y;
        this.layer.setScale(3,3);
    }
    getCenterOfObject(object: Phaser.Physics.Arcade.Sprite)
    {
        if(object && object.body)
        {
            let width = object.body.width;
            let height = object.body.height;
            let x = object.body.x + Math.floor(width/2);
            let y = object.body.y + Math.floor(height/2);
            return [x,y];
        }
        else
        {
            console.error("No Sprite or Body");
            return [0,0];
        }
    }
    checkTileCollision(direction: string, object: Phaser.Physics.Arcade.Sprite) 
    {

        if(object && object.body)
        {
            let tile: Phaser.Tilemaps.Tile;
            let width = object.body.width;
            let height = object.body.height;

            let [x,y] = this.getCenterOfObject(object);

            if (direction == "left")
            {
                tile = this.layer.getTileAtWorldXY(x - width, y);
            }
            else if (direction == "right")
            {
                tile = this.layer.getTileAtWorldXY(x + width, y);
            }
            else if(direction == "down")
            {
                tile = this.layer.getTileAtWorldXY(x, y+height);
            }
            else
            {
                tile = this.layer.getTileAtWorldXY(x, y-height);
            }

            return tile;
        }
        else
        {
            console.error("No Sprite or Body");

            return null;
        }
    }
    getTileAtObject(object: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        return tile
    }
    handleDynamite()
    {
        let [x,y] = this.getCenterOfObject(this.scene.player);
        new Dynamite(this.scene, x, y, "dynamite");
    }
    removeGroundTiles(x:integer, y:integer)
    {
        if(this instanceof GroundLayer)
        {
            this.layer.removeTileAt(x,y);
            this.scene.DarknessLayer.removeDarknessTiles(x,y);
        }
        else
        {
            console.log("Not supposed to be called by non-ground layer");
        }

    }
}