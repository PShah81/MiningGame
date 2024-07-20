import GameScene from "../GameScene";
import BaseLayer from "./BaseLayer";

export default class InvisibleLayer extends BaseLayer
{
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
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
        let newTileX;
        let newTileY;
        for(let i=-1; i<2; i++)
        {
            for(let j=-1; j<2; j++)
            {
                newTileX = tileX + i;
                newTileY = tileY + j;
                this.layer.removeTileAt(newTileX, newTileY);
            }
        }
    }
}