import phaser from 'phaser';
export const States = {
    IDLE: 0,
    WALK: 1,
    RUN: 2,
    MINE: 3,
    JUMP: 4,
    FALL: 5,
    LAND: 6,
    CLIMB: 7,
}
export const Directions = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
    IDLE: 4
}
export const Items = {
    LADDER: 0,
    TORCH: 1,
    DYNAMITE: 2
}




class PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        this.player = player;
        this.scene = scene;
        this.TileComponent = TileComponent;
        this.PlayerStateManager = PlayerStateManager;
    }

    enter() {}
    exit() {}
    update(cursors) {}
    moveHorizontally(direction)
    {
        let velocity = this.player.body.velocity;
        this.player.setAccelerationX(0);
        if(direction == Directions.LEFT)
        {
            this.player.setFlipX(true);
            this.player.setVelocityX(Math.min(-100, velocity.x));
        }
        else
        {
            this.player.setFlipX(false);
            this.player.setVelocityX(Math.max(100, velocity.x));
        }
    }
    craft(lastKeyPressed)
    {
        let itemIndex = -1;
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.ONE)
        {
            itemIndex = Items.LADDER;
        }
        else if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.TWO)
        {
            itemIndex = Items.TORCH;
        }
        if(itemIndex != -1)
        {
            this.TileComponent.placeItem(itemIndex);
        }
    }
    dropDynamite(lastKeyPressed)
    {
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.THREE)
        {
            let [x,y] = this.TileComponent.getCenter(this.player);
            let dynamite = this.scene.physics.add.sprite(x, y, "dynamite");
            this.scene.dynamiteColliderGroup.add(dynamite);
            dynamite.anims.play("dynamite", true);
            let explosion;
            
            dynamite.on('animationcomplete-dynamite', () =>{
                let x = dynamite.x;
                let y = dynamite.y;
                dynamite.destroy();
                explosion = this.scene.physics.add.sprite(x, y, "explosion");
                this.scene.explosionOverlapGroup.add(explosion);
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
}

export class Idle extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }
    enter(direction)
    {
        this.player.anims.play("idle", true);
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        this.player.setAccelerationX(0);
        this.player.setAccelerationY(0);
    }
    update(cursors, lastKeyPressed)
    {
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.WALK, Directions.LEFT);
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.WALK, Directions.RIGHT);
            }
        }
        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.JUMP);
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);
        if(!this.PlayerStateManager.acted)
        {
            this.PlayerStateManager.changeState(States.IDLE, null);
        }
    }
}

export class Walk extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.direction = direction;
        if(direction == Directions.LEFT)
        {
            this.moveHorizontally(direction);
            this.player.setAccelerationX(-50);
        }
        else
        {
            this.moveHorizontally(direction);
            this.player.setAccelerationX(50);
        }
        this.player.anims.play("walk", true);
    }
    update(cursors, lastKeyPressed)
    {
        let velocity = this.player.body.velocity;
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x < -200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.LEFT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.LEFT);
                }
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x > 200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.RIGHT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.RIGHT);
                }
            }
        }
        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.JUMP);
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);

        if(!this.PlayerStateManager.acted)
        {
            if(!this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.FALL);
            }
            else
            {
                this.PlayerStateManager.changeState(States.IDLE);
            }
        }
        
    }
}

export class Run extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.direction = direction;
        if(direction == Directions.LEFT)
        {
            this.player.setAccelerationX(-75);
        }
        else
        {
            this.player.setAccelerationX(75);
        }
        this.player.anims.play("run", true);
    }
    update(cursors, lastKeyPressed)
    {
        let velocity = this.player.body.velocity;
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x < -200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.LEFT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.LEFT);
                }
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x > 200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.RIGHT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.RIGHT);
                }
            }
        }
        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.JUMP);
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        
        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);

        if(!this.PlayerStateManager.acted)
        {
            if(!this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.FALL);
            }
            else
            {
                this.PlayerStateManager.changeState(States.IDLE);
            }
        }
    }
}

export class Mine extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.direction = direction;
        if(direction == Directions.LEFT)
        {
            this.moveHorizontally(direction);
        }
        else if(direction == Directions.RIGHT)
        {
            this.moveHorizontally(direction);
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.setAccelerationX(0);
        }
        this.player.anims.play("mine", true);
    }
    update(cursors, lastKeyPressed)
    {
        if(this.scene.currentMiningDirection && this.scene.miningTile)
        {
            let tile = this.TileComponent.checkTileCollision(this.scene.currentMiningDirection, this.scene.groundLayer);

            if (!tile || (tile && (tile.x != this.scene.miningTile.x || tile.y != this.scene.miningTile.y)))
            {
                this.TileComponent.stopMining();
            }
        }
        if (cursors.left.isDown)
        {
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.WALK, Directions.LEFT);
            }
        }
        if (cursors.right.isDown)
        {
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.WALK, Directions.RIGHT);
            }
        }
        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.JUMP);
            }
        }
        if(cursors.down.isDown)
        {
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }

        if(!this.PlayerStateManager.acted)
        {
            if(!this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.FALL);
            }
            else
            {
                this.PlayerStateManager.changeState(States.IDLE);
            }
        }
    }
    exit()
    {
        this.TileComponent.stopMining()
    }
}

export class Jump extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.player.setVelocityY(-250);
        this.player.anims.play("jump", true);
    }
    update(cursors, lastKeyPressed)
    {
        if(this.player.body.onFloor())
        {
            this.PlayerStateManager.changeState(States.LAND);
        }
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            this.moveHorizontally(Directions.LEFT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
        }
        else if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
        }
        else
        {
            //If not left or right are down
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }

        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
        }
        if(cursors.down.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        
        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);
    }
}

export class Fall extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.player.setAccelerationX(0);
        this.player.anims.play("fall", true);
    }
    update(cursors, lastKeyPressed)
    {
        if(this.player.body.onFloor())
        {
            this.PlayerStateManager.changeState(States.LAND);
        }
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            this.moveHorizontally(Directions.LEFT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
        }
        else if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
        }
        else
        {
            //If not left or right are down
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }
        
        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
        }
        if(cursors.down.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        
        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);
    }
}

export class Land extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        //Have to store next state until landing animation finishes
        this.nextState = States.IDLE;
        this.nextDirection = null;
        this.nextProps = {};
        this.player.anims.play("land", true).on('animationcomplete-land', 
        ()=>{this.PlayerStateManager.changeState(this.nextState, this.nextDirection, this.nextProps)}, this);
        console.log("here")
    }
    update(cursors, lastKeyPressed)
    {
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.nextState = States.MINE;
                this.nextDirection = Directions.LEFT;
            }
            else if(this.player.body.onFloor())
            {
                this.nextState = States.WALK;
                this.nextDirection = Directions.LEFT;
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.nextState = States.MINE;
                this.nextDirection = Directions.RIGHT;
            }
            else if(this.player.body.onFloor())
            {
                this.nextState = States.WALK;
                this.nextDirection = Directions.RIGHT;
            }
        }
        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.nextState = States.CLIMB;
                this.nextDirection = Directions.UP;
            }
            else if(this.player.body.onFloor())
            {
                this.nextState = States.JUMP;
                this.nextDirection = null;
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.nextState = States.MINE;
                this.nextDirection = Directions.DOWN;
            }
            else if(this.PlayerStateManager.canClimb)
            {
                this.nextState = States.CLIMB;
                this.nextDirection = Directions.DOWN;
            }
        }
        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);

        if(this.nextState == States.IDLE)
        {
            if(!this.player.body.onFloor())
            {
                this.nextState = States.FALL;
                this.nextDirection = null;
            }
            else
            {
                this.nextState = States.IDLE;
                this.nextDirection = null;
            }
        }
    }

}

export class Climb extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.direction = direction;
        this.player.body.setAllowGravity(false);

        if(direction == Directions.UP)
        {
            if(this.currentFrame)
            {
                this.player.anims.play({key:"climbUp", frame: this.currentFrame}, true);
            }
            else
            {
                this.player.anims.play("climbUp", true);
            }
            this.player.setVelocityY(-150);
            
        }
        else if(direction == Directions.DOWN)
        {
            if(this.currentFrame)
            {
                this.player.anims.play({key:"climbDown", frame: this.currentFrame}, true);
            }
            else
            {
                this.player.anims.play("climbDown", true);
            }
            this.player.setVelocityY(150);
        }
        else
        {
            if(["climbUp", "climbDown"].includes(this.player.anims.currentAnim.key))
            {
                this.currentFrame = this.player.anims.currentFrame;
                this.player.anims.pause();
            }
            else
            {
                this.player.anims.play("climbIdle")
            }
            this.player.setVelocityY(0);
        }
    }
    update(cursors, lastKeyPressed)
    {
        let velocity = this.player.body.velocity;
        if (cursors.left.isDown)
        {
            this.moveHorizontally(Directions.LEFT);
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.LEFT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x < -200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.LEFT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.LEFT);
                }
            }
        }
        else if (cursors.right.isDown)
        {
            this.moveHorizontally(Directions.RIGHT);
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
            else if(this.player.body.onFloor())
            {
                if(velocity.x > 200)
                {
                    this.PlayerStateManager.changeState(States.RUN, Directions.RIGHT);
                }
                else
                {
                    this.PlayerStateManager.changeState(States.WALK, Directions.RIGHT);
                }
            }
        }
        else
        {
            //If not left or right are down
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }

        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.JUMP);
            }
        }
        if(cursors.down.isDown)
        {
            
            if(this.player.body.onFloor())
            {
                this.TileComponent.startMining("down");
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down")
                {
                    this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
                }
            }
            if(this.PlayerStateManager.canClimb)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);
        if(!this.PlayerStateManager.acted)
        {
            
            if(this.PlayerStateManager.canClimb && !this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.IDLE);
            }
            else if(this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.IDLE);
            }
            else
            {
                this.PlayerStateManager.changeState(States.FALL);
            }
        }
        
    }

    exit(enumState)
    {
        if(enumState != States.CLIMB)
        {
            this.player.body.setAllowGravity(true);
        }
    }
}