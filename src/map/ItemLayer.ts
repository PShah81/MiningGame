import BaseLayer from "./BaseLayer.ts";
import {Items} from '../player/PlayerStateClasses.ts';
import GameScene from "../GameScene.ts";
import Player from "../player/Player.ts";
import { GameObjects } from "phaser";

export default class ItemLayer extends BaseLayer
{
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
        this.layer.setPipeline("Light2D");
    }
    placeItem(tileIndex: integer, object: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tileXY = this.layer.worldToTileXY(x, y);
        let tile = this.layer.getTileAt(tileXY.x,tileXY.y);
        if(!tile)
        {
            return this.placeItemHelper(tileIndex, tileXY.x, tileXY.y);
        }
        return false;
    }
    placeItemHelper(tileIndex: integer, tileX: number, tileY: number)
    {
        let tilePlaced = this.layer.putTileAt(tileIndex, tileX, tileY);
        if(tilePlaced)
        {
            let preciseVector = this.layer.tileToWorldXY(tileX, tileY);
            let preciseX = preciseVector.x + tilePlaced.width/2;
            let preciseY = preciseVector.y + tilePlaced.height/2;
            if(tileIndex == Items.TORCH)
            {
                this.scene.lights.addLight(preciseX,preciseY, 200).setIntensity(4);
            }
            return true;
        }
        return false;
    }
    placeLadder(tileIndex: integer, tileX: number, tileY: number)
    {

    }
    removeItem(object: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        if(tile)
        {
           this.removeLightsAndTile(tile);
        }
    }
    itemsExploded = (explosion: Phaser.Tilemaps.Tile | GameObjects.GameObject, itemsTile: Phaser.Tilemaps.Tile | GameObjects.GameObject) => {
        if(itemsTile instanceof Phaser.Tilemaps.Tile)
        {
            this.removeLightsAndTile(itemsTile);
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
            else if(player instanceof Player && tile.index != Items.LADDER)
            {
                player.canClimb = false;
            }
        }
    }
    removeLightsAndTile(tile: Phaser.Tilemaps.Tile)
    {
        let preciseVector = this.layer.tileToWorldXY(tile.x, tile.y);
        let preciseX = preciseVector.x + tile.width/2;
        let preciseY = preciseVector.y + tile.height/2;
        if(tile.index == Items.TORCH)
        {
            let lightArray = this.scene.lights.lights;
            for (let i = lightArray.length - 1; i >= 0; i--) {
                const light = lightArray[i];
                if (light.x === preciseX && light.y === preciseY) {
                    this.scene.lights.removeLight(light); // Remove the light from the scene
                    break;
                }
            }
        }
        this.layer.removeTileAt(tile.x, tile.y);
    }
}