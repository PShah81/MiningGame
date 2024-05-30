class PlayerStates {
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.player;
        this.cursors = this.scene.cursors;
    }
    update()
    {
        this.scene.lastActionState = this.scene.actionState;
        this.scene.actionState = null;
        this.scene.movementState = "idle";
        //Continue landing animations
        if(this.scene.lastActionState == "land" || this.scene.lastActionState == "jump")
        {
            this.scene.actionState = this.scene.lastActionState;
        }
        //Handle fall
        if(!this.player.body.onFloor() && this.scene.lastActionState != "jump")
        {
            this.scene.actionState = "fall";
        }
        //Handle jump
        if((this.scene.lastActionState == "jump" || this.scene.lastActionState == "fall") && this.player.body.onFloor())
        {
            //Begin landing animations
            this.scene.actionState = "land";
        }
        //Horizontal Motion
        if (this.cursors.left.isDown)
        {
            let velocity = this.player.body.velocity;
            if(this.scene.actionState != "land")
            {
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
                {
                    this.scene.actionState = "leftMine";
                }
                else if(this.player.body.onFloor())
                {
                    if(velocity.x < -200)
                    {
                        this.scene.actionState = "leftRun";
                    }
                    else
                    {
                        this.scene.actionState = "leftWalk";
                    }
                }
            }
            this.scene.movementState = "left";
            
        }
        else if (this.cursors.right.isDown)
        {
            let velocity = this.player.body.velocity;
            if(this.scene.actionState != "land")
            {
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
                {
                    this.scene.actionState = "rightMine";
                }
                else if(this.player.body.onFloor())
                {
                    if(velocity.x > 200)
                    {
                        this.scene.actionState = "rightRun";
                    }
                    else
                    {
                        this.scene.actionState = "rightWalk";
                    }
                }
            }
            this.scene.movementState = "right";
        }

        //Vertical Motion
        if (this.cursors.up.isDown) 
        {
            if(this.player.body.onFloor() && this.scene.actionState != "land")
            {
                this.scene.actionState = "jump";
                this.scene.movementState = "up";
            }
        }
        else if(this.cursors.down.isDown) 
        {
            if(this.player.body.onFloor() && this.scene.actionState != "land")
            {
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down")
                {
                    this.scene.actionState = "downMine";  
                } 
            }
            this.scene.movementState = "down";
        }


        if(!this.scene.actionState && this.player.body.onFloor()) 
        {
            this.scene.actionState = "idle";
        }
    }
}

export default PlayerStates