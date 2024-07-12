import GameScene from "../GameScene";

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
    }
    getCenterOfObject(object?: Phaser.Physics.Arcade.Sprite)
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
            console.log("No Sprite or Body");
            return [0,0];
        }
    }
    checkTileCollision(direction: string, object?: Phaser.Physics.Arcade.Sprite) 
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
            console.log("No Sprite or Body");

            return null;
        }
    }
    getTileAtObject(object?: Phaser.Physics.Arcade.Sprite)
    {
        let [x,y] = this.getCenterOfObject(object);
        let tile = this.layer.getTileAtWorldXY(x, y);
        return tile
    }
    handleDynamite()
    {
        let [x,y] = this.getCenterOfObject(this.scene.player);
        let dynamite = this.scene.physics.add.sprite(x, y, "dynamite");
        if(this.scene.dynamiteColliderGroup)
        {
            this.scene.dynamiteColliderGroup.add(dynamite);
        }
        dynamite.anims.play("dynamite", true);
        
        dynamite.on('animationcomplete-dynamite', () =>{
            let x = dynamite.x;
            let y = dynamite.y;
            dynamite.destroy();
            let explosion = this.scene.physics.add.sprite(x, y, "explosion");
            if(this.scene.explosionOverlapGroup)
            {
                this.scene.explosionOverlapGroup.add(explosion);
            }
            explosion.body.setAllowGravity(false);
            explosion.body.setVelocityY(0);
            explosion.setScale(3);
            explosion.anims.play("explosion", true);
            explosion.on('animationcomplete-explosion', function() {
                explosion.destroy()
            });
        });
    }
}