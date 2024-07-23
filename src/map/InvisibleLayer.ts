import GameScene from "../GameScene.ts";
import BaseLayer from "./BaseLayer.ts";

export default class InvisibleLayer extends BaseLayer
{
    exploredTileSet: Set<string>
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
        this.exploredTileSet = new Set<string>();
        this.generateInitialInvisibilityTiles(this.layer.tilemap.width, this.layer.tilemap.height);
    }
    generateInitialInvisibilityTiles(width: integer, height: integer)
    {
        for(let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tileIndex = 0;
                if(y == 0)
                {
                    tileIndex = 1;
                }
                this.layer.putTileAt(tileIndex, x, y);
            }
        }
    }
    removeInvisibilityTiles(tileX: integer, tileY: integer)
    {
        let groundTile;
        let darknessTile;
        let newTileX;
        let newTileY;
        let key = `${tileX.toString()},${tileY.toString()}`;
        this.exploredTileSet.add(key);
        for(let i=-1; i<2; i++)
        {
            for(let j=-1; j<2; j++)
            {
                newTileX = tileX + i;
                newTileY = tileY + j;
                groundTile = this.scene.GroundLayer.layer.getTileAt(newTileX, newTileY);
                this.layer.removeTileAt(newTileX, newTileY);
                key = `${newTileX.toString()},${newTileY.toString()}`;
                //The ground tile is missing and the tile hasn't been explored yet
                if(!groundTile && !this.exploredTileSet.has(key) && (j==0 || i==0) && (j != 0 || i != 0) && InvisibleLayer.checkIfTileIsValid(newTileX, newTileY, this.layer))
                {
                    this.removeInvisibilityTiles(newTileX, newTileY);
                }
            }
        }
    }
    static checkIfTileIsValid(tileX: integer, tileY: integer, layer: Phaser.Tilemaps.TilemapLayer)
    {
        if(tileX >= 0 && tileX < layer.tilemap.width && tileY >= 0 && tileY < layer.tilemap.height)
        {
            return true;
        }
        return false;
    }
}