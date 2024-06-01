import phaser from 'phaser';
const States = {
    IDLE: 0,
    WALK: 1,
    RUN: 2,
    MINE: 3,
    JUMP: 4,
    FALL: 5,
    LAND: 6,
    CRAFT: 7,
    CLIMB: 8,
}
const Directions = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
    IDLE: 4
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
}

export class Idle extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
        console.log(TileComponent);
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
        }
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
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
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
        }
        if(cursors.up.isDown)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
        }
        if(cursors.down.isDown)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
        }
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
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.RIGHT);
            }
        }
        if(cursors.up.isDown)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.UP);
            }
        }
        if(cursors.down.isDown)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
        }
    }
}

export class Land extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.nextState = States.IDLE;
        this.nextDirection = null;
        this.player.anims.play("land", true).on('animationcomplete-land', 
        ()=>{this.PlayerStateManager.changeState(this.nextState, this.nextDirection)}, this);
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.nextState = States.MINE;
                this.nextDirection = Directions.DOWN;
            }
            else if(tile && tile.index == 0)
            {
                this.nextState = States.CLIMB;
                this.nextDirection = Directions.DOWN;
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.nextState = States.CRAFT;
            this.nextDirection = null;
        }
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

export class Craft extends PlayerState {
    enter()
    {
        this.TileComponent.placeItem(0);
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.player.body.onFloor())
            {
                this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
            }
            else if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }

        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
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
            this.currentFrame = this.player.anims.currentFrame;
            this.player.anims.pause();
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
        if (cursors.right.isDown)
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
        if(cursors.up.isDown)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0)
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
            let tile = this.TileComponent.getItemAtPlayer();
            if(this.player.body.onFloor())
            {
                this.TileComponent.startMining("down");
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down")
                {
                    this.PlayerStateManager.changeState(States.MINE, Directions.DOWN);
                }
            }
            if(tile && tile.index == 0)
            {
                this.PlayerStateManager.changeState(States.CLIMB, Directions.DOWN);
            }
        }
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.PlayerStateManager.changeState(States.CRAFT);
        }

        if(!this.PlayerStateManager.acted)
        {
            let tile = this.TileComponent.getItemAtPlayer();
            if(tile && tile.index == 0 && !this.player.body.onFloor())
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