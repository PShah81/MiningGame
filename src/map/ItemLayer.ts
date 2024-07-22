import BaseLayer from "./BaseLayer";
import {Items} from '../player/PlayerStateClasses';
import GameScene from "../GameScene";
import Player from "../player/Player";
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
        let tile = this.layer.getTileAtWorldXY(x, y);
        if(!tile)
        {
            let tilePlaced = this.layer.putTileAtWorldXY(tileIndex, x, y);
            if(tilePlaced)
            {
                let preciseVector = this.layer.tileToWorldXY(tilePlaced.x, tilePlaced.y);
                let preciseX = preciseVector.x;
                let preciseY = preciseVector.y;
                if(tileIndex == Items.TORCH)
                {
                    this.scene.lights.addLight(preciseX,preciseY, 200).setIntensity(4);
                }
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
            else if(player instanceof Player)
            {
                player.canClimb = false;
            }
        }
    }
    removeLightsAndTile(tile: Phaser.Tilemaps.Tile)
    {
        let preciseVector = this.layer.tileToWorldXY(tile.x, tile.y);
        let preciseX = preciseVector.x;
        let preciseY = preciseVector.y;
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