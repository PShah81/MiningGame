import TileComponent from './TileComponent';

class PlayerMovements {
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.player;
        this.TileComponent = new TileComponent(scene);
    }
    update()
    {
        console.log(this.scene.movementState)
        let velocity = this.player.body.velocity;
        //Horizontal
        if(this.scene.movementState == "left")
        {
            if(velocity.x >= 0)
            {
                this.player.setVelocityX(-150);
            }
            this.player.setAccelerationX(-50);
            this.player.setFlipX(true);
            this.TileComponent.startMining("left"); 
        }
        else if(this.scene.movementState == "right")
        {
            if(velocity.x <= 0)
            {
                this.player.setVelocityX(150);
            }
            this.player.setAccelerationX(50);
            this.player.setFlipX(false);
            this.TileComponent.startMining("right");
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.setAccelerationX(0);
        }

        //Vertical
        if(this.scene.movementState == "up")
        {
            this.player.setVelocityY(-250);
            this.TileComponent.stopMining(); 
        }
        else if(this.scene.movementState == "down")
        {
            this.TileComponent.startMining("down");
        }

        if(this.scene.movementState == "idle")
        {
            this.TileComponent.stopMining();
        }

        // If not mining the same tile anymore stop mining
        if(this.scene.currentMiningDirection && this.scene.miningTile)
        {
            let tile = this.TileComponent.checkTileCollision(this.scene.currentMiningDirection);

            if (!tile || (tile && (tile.x != this.scene.miningTile.x || tile.y != this.scene.miningTile.y)))
            {
                this.TileComponent.stopMining();
            }
        }
    }
}



export default PlayerMovements