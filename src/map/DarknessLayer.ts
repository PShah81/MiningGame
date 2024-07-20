import GameScene from "../GameScene";
import BaseLayer from "./BaseLayer";

export default class DarknessLayer extends BaseLayer
{
    constructor(scene: GameScene, layer: Phaser.Tilemaps.TilemapLayer, x: integer, y: integer)
    {
        super(scene, layer, x, y);
        this.generateInitialDarkness(this.layer.tilemap.width, this.layer.tilemap.height);
    }
    generateInitialDarkness(width: integer, height: integer)
    {
        for(let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                console.log("he")
                let tileIndex = 0;
                if(y == 0)
                {
                    tileIndex = 1;
                }
                this.layer.putTileAt(tileIndex, x, y);
            }
        }
    }
    removeDarknessTiles(tileX: integer, tileY: integer)
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