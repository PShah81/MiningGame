import BaseLayer from "./BaseLayer";
import {Items} from '../player/PlayerStateClasses';

export default class ItemLayer extends BaseLayer
{
    constructor(scene, layer, x, y)
    {
        super(scene, layer, x, y);
        this.layer.setScale(2.35,2.35);
    }
    placeItem(tileIndex, object)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        if(!tile)
        {
            this.layer.putTileAtWorldXY(tileIndex, x, y);
        }
    }
    removeItems = (explosion, itemsTile) => {
        this.layer.removeTileAt(itemsTile.x,itemsTile.y);
    }
    canClimb = (player, tile) =>
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
            player.body &&
            player.body.left>=left && 
            player.body.right<= right &&
            player.body.bottom - Math.floor(player.body.height/4) > top &&
            player.body.top + Math.floor(player.body.height/4) < bottom)
        {
            player.canClimb = true;
        }
        
    }
}