import BaseLayer from "./BaseLayer";
import {Items} from '../player/PlayerStateClasses';
import GameScene from "~/GameScene";
import Player from "../player/Player";
import { GameObjects } from "phaser";

export default class ItemLayer extends BaseLayer
{
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
    }
    placeItem(tileIndex: integer, object: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        if(!tile)
        {
            let tilePlaced = this.layer.putTileAtWorldXY(tileIndex, x, y);
            if(tilePlaced)
            {
                return true;
            }
        }
        return false;
    }
    removeItem(object: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        if(tile)
        {
            this.layer.removeTileAt(tile.x, tile.y);
        }
    }
    itemsExploded = (explosion: Phaser.Tilemaps.Tile | GameObjects.GameObject, itemsTile: Phaser.Tilemaps.Tile | GameObjects.GameObject) => {
        if(itemsTile instanceof Phaser.Tilemaps.Tile)
        {
            this.layer.removeTileAt(itemsTile.x,itemsTile.y);
        }
        else
        {
            console.error("Got game object instead of tile");
        }
    }
    canClimb = (player: Phaser.Tilemaps.Tile | GameObjects.GameObject, tile: Phaser.Tilemaps.Tile | GameObjects.GameObject) =>
    {
        if(tile instanceof Phaser.Tilemaps.Tile)
        {
            let vec = this.layer.tileToWorldXY(tile.x, tile.y);
            let width = this.layer.tileToWorldX(1) - this.layer.tileToWorldX(0);
            let height = this.layer.tileToWorldY(1) - this.layer.tileToWorldY(0);
            let left = vec.x;
            let right = vec.x + width;
            let top = vec.y;
            let bottom = top + height;
            
            if(tile.index == Items.LADDER &&
                player &&
                player instanceof Player &&
                player.body &&
                player.body.left>=left && 
                player.body.right<= right &&
                player.body.bottom - Math.floor(player.body.height/4) > top &&
                player.body.top + Math.floor(player.body.height/4) < bottom)
            {
                player.canClimb = true;
            }
            else if(player instanceof Player)
            {
                player.canClimb = false;
            }
        }
    }
}