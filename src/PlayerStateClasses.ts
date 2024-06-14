import TileComponent from "./TileComponent";
import PlayerStateManager from "./PlayerStateManager";
import GameScene from "./GameScene";
export enum States{
    IDLE = 0,
    WALK = 1,
    RUN = 2,
    MINE = 3,
    JUMP = 4,
    FALL = 5,
    LAND = 6,
    CLIMB = 7,
    ATTACK = 8
}
export enum Directions {
    LEFT = 0,
    RIGHT = 1,
    UP = 2,
    DOWN = 3,
    IDLE = 4
}
export enum Items {
    LADDER = 0,
    TORCH = 1,
    DYNAMITE = 2
}



export class PlayerState {

    scene: GameScene
    player: Phaser.Physics.Arcade.Sprite & {body: Phaser.Physics.Arcade.Body}
    TileComponent: TileComponent
    PlayerStateManager: PlayerStateManager
    direction: Directions | null
    finishedAnimation: Boolean
    constructor(player, scene, TileComponent, PlayerStateManager) {
        this.player = player;
        this.scene = scene;
        this.TileComponent = TileComponent;
        this.PlayerStateManager = PlayerStateManager;
        this.direction = null;
        this.finishedAnimation = false;
    }

    enter(direction) {}
    exit(exitState) {}
    update(cursors, lastKeyPressed) {}
    moveHorizontally(direction)
    {
        let velocity = this.getPlayerVelocity();
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
            if(this.scene.dynamiteColliderGroup)
            {
                this.scene.dynamiteColliderGroup.add(dynamite);
            }
            dynamite.anims.play("dynamite", true);
            let explosion;
            
            dynamite.on('animationcomplete-dynamite', () =>{
                let x = dynamite.x;
                let y = dynamite.y;
                dynamite.destroy();
                explosion = this.scene.physics.add.sprite(x, y, "explosion");
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
    playerOnFloor()
    {
        if(this.player.body.onFloor())
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    getPlayerVelocity()
    {
        return this.player.body.velocity
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
        let newState;
        let newDirection;

        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if(this.playerOnFloor())
            {
                newState = States.WALK;
                newDirection = Directions.LEFT;
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if(this.playerOnFloor())
            {
                newState = States.WALK;
                newDirection = Directions.RIGHT;
            }
        }

        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if(this.playerOnFloor())
            {
                newState = States.JUMP;
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(!newState)
        {
            newState = States.IDLE;
        }

        this.PlayerStateManager.changeState(newState, newDirection);
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
        let newState;
        let newDirection;
        let velocity = this.getPlayerVelocity();

        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x < -200)
                {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x > 200)
                {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }

        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if(this.playerOnFloor())
            {
                newState = States.JUMP;
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(!newState)
        {
            if(!this.playerOnFloor())
            {
                newState = States.FALL;
            }
            else
            {
                newState = States.IDLE;
            }
        }
        
        this.PlayerStateManager.changeState(newState, newDirection);
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
        let newState;
        let newDirection;
        let velocity = this.getPlayerVelocity();

        this.craft(lastKeyPressed);
        this.dropDynamite(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x < -200)
                {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x > 200)
                {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }

        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if(this.playerOnFloor())
            {
                newState = States.JUMP;
            }
        }
        if(cursors.down.isDown)
        {
            this.TileComponent.startMining("down");
            
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(!newState)
        {
            if(!this.playerOnFloor())
            {
                newState = States.FALL;
            }
            else
            {
                newState = States.IDLE;
            }
        }
        
        this.PlayerStateManager.changeState(newState, newDirection);
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
        let newState;
        let newDirection;

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
            console.log(this.scene.currentMiningDirection);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if(this.playerOnFloor())
            {
                newState = States.WALK;
                newDirection = Directions.LEFT;
            }
        }
        if (cursors.right.isDown)
        {
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if(this.playerOnFloor())
            {
                newState = States.WALK;
                newDirection = Directions.RIGHT;
            }
        }

        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if(this.playerOnFloor())
            {
                newState = States.JUMP;
            }
        }
        if(cursors.down.isDown)
        {
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(!newState)
        {
            if(!this.playerOnFloor())
            {
                newState = States.FALL;
            }
            else
            {
                newState = States.IDLE;
            }
        }

        this.PlayerStateManager.changeState(newState, newDirection);
    }
    exit()
    {
        console.log("exito")
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
        this.finishedAnimation = false;
        this.player.anims.play("jump", true).on('animationcomplete-jump', 
        ()=>{this.finishedAnimation = true}, this);
    }
    update(cursors, lastKeyPressed)
    {
        let newState;
        let newDirection;

        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);

        if(this.finishedAnimation)
        {
            if(this.playerOnFloor())
            {
                newState = States.LAND;
            }
            if (cursors.left.isDown)
            {
                this.TileComponent.startMining("left");
                this.moveHorizontally(Directions.LEFT);
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
                {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
            }
            else if (cursors.right.isDown)
            {
                this.TileComponent.startMining("right");
                this.moveHorizontally(Directions.RIGHT);
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
                {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
            }
            else
            {
                //If not left or right
                this.player.setAccelerationX(0);
                this.player.setVelocityX(0);
            }

            if(cursors.space.isDown)
            {
                newState = States.ATTACK;
            }
    
            if(cursors.up.isDown)
            {
                if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
            }
            if(cursors.down.isDown)
            {
                if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }

            if(!newState)
            {
                if(!this.playerOnFloor())
                {
                    newState = States.FALL;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
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
        let newState;
        let newDirection;

        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);
        if (cursors.left.isDown)
        {
            this.TileComponent.startMining("left");
            this.moveHorizontally(Directions.LEFT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
        }
        else if (cursors.right.isDown)
        {
            this.TileComponent.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
        }
        else
        {
            //If not left or right
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }

        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
        }
        if(cursors.down.isDown)
        {
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(this.playerOnFloor())
        {
            newState = States.LAND;
        }
        if(!newState)
        {
            if(!this.playerOnFloor())
            {
                newState = States.FALL;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection);
    }
}

export class Land extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.finishedAnimation = false;
        this.player.anims.play("land", true).on('animationcomplete-land', 
        ()=>{this.finishedAnimation = true}, this);
    }
    update(cursors, lastKeyPressed)
    {
        let newState;
        let newDirection;

        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);

        if(this.finishedAnimation)
        {
            if (cursors.left.isDown)
            {
                this.TileComponent.startMining("left");
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
                {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
                else if(this.playerOnFloor())
                {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
            if (cursors.right.isDown)
            {
                this.TileComponent.startMining("right");
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
                {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
                else if(this.playerOnFloor())
                {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }

            if(cursors.space.isDown)
            {
                newState = States.ATTACK;
            }

            if(cursors.up.isDown)
            {
                
                if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
                else if(this.playerOnFloor())
                {
                    newState = States.JUMP;
                }
            }
            if(cursors.down.isDown)
            {
                this.TileComponent.startMining("down");
                
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }

            if(!newState)
            {
                if(!this.playerOnFloor())
                {
                    newState = States.FALL;
                }
                else
                {
                    newState = States.IDLE;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    }

}

export class Climb extends PlayerState {
    currentFrame: integer | null
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
        this.currentFrame = null;
    }

    enter(direction)
    {
        this.direction = direction;
        this.player.body.setAllowGravity(false);

        if(direction == Directions.UP)
        {
            if(this.currentFrame)
            {
                
                this.player.anims.play({key:"climbUp", startFrame: this.currentFrame}, true);
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
                this.player.anims.play({key:"climbDown", startFrame: this.currentFrame}, true);
            }
            else
            {
                this.player.anims.play("climbDown", true);
            }
            this.player.setVelocityY(150);
        }
        else
        {
            if(this.player.anims.currentAnim && this.player.anims.currentFrame && ["climbUp", "climbDown"].includes(this.player.anims.currentAnim.key))
            {
                this.currentFrame = this.player.anims.currentFrame.index;
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
        let velocity = this.getPlayerVelocity();
        let newState;
        let newDirection;

        this.craft(lastKeyPressed)
        this.dropDynamite(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.moveHorizontally(Directions.LEFT);
            this.TileComponent.startMining("left");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x < -200)
                {
                    newState = States.RUN;
                    newDirection = Directions.LEFT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.LEFT;
                }
            }
        }
        else if (cursors.right.isDown)
        {
            this.moveHorizontally(Directions.RIGHT);
            this.TileComponent.startMining("right");
            if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
            {
                newState = States.MINE;
                newDirection = Directions.RIGHT;
            }
            else if(this.playerOnFloor())
            {
                if(velocity.x > 200)
                {
                    newState = States.RUN;
                    newDirection = Directions.RIGHT;
                }
                else
                {
                    newState = States.WALK;
                    newDirection = Directions.RIGHT;
                }
            }
        }
        else
        {
            //If not left or right are down
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0);
        }
        
        if(cursors.space.isDown)
        {
            newState = States.ATTACK;
        }

        if(cursors.up.isDown)
        {
            
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
            else if(this.playerOnFloor())
            {
                newState = States.JUMP;
            }
        }
        if(cursors.down.isDown)
        {
            
            if(this.playerOnFloor())
            {
                this.TileComponent.startMining("down");
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down")
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
            }
            if(this.PlayerStateManager.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        if(!newState)
        {
            
            if(this.PlayerStateManager.canClimb && !this.playerOnFloor())
            {
                newState = States.CLIMB;
                newDirection = Directions.IDLE;
            }
            else if(this.playerOnFloor())
            {
                newState = States.IDLE;
            }
            else
            {
                newState = States.FALL;
            }
        }
        this.PlayerStateManager.changeState(newState, newDirection)
        
    }

    exit(exitState)
    {
        if(exitState != States.CLIMB)
        {
            this.player.body.setAllowGravity(true);
        }
    }
}

export class Attack extends PlayerState {
    constructor(player, scene, TileComponent, PlayerStateManager) {
        super(player, scene, TileComponent, PlayerStateManager);
    }

    enter(direction)
    {
        this.finishedAnimation = false;
        this.player.anims.play("attack", true).on('animationcomplete-attack', 
        ()=>{this.finishedAnimation = true}, this);
    }
    update(cursors, lastKeyPressed)
    {
        let newState;
        let newDirection;
        let velocity = this.getPlayerVelocity();

        if(this.finishedAnimation)
        {
            if (cursors.left.isDown)
            {
                this.TileComponent.startMining("left");
                this.moveHorizontally(Directions.LEFT);
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "left")
                {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
                else if(this.playerOnFloor())
                {
                    if(velocity.x < -200)
                    {
                        newState = States.RUN;
                        newDirection = Directions.LEFT;
                    }
                    else
                    {
                        newState = States.WALK;
                        newDirection = Directions.LEFT;
                    }
                }
            }
            else if (cursors.right.isDown)
            {
                this.TileComponent.startMining("right");
                this.moveHorizontally(Directions.RIGHT);
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "right")
                {
                    newState = States.MINE;
                    newDirection = Directions.RIGHT;
                }
                else if(this.playerOnFloor())
                {
                    if(velocity.x > 200)
                    {
                        newState = States.RUN;
                        newDirection = Directions.RIGHT;
                    }
                    else
                    {
                        newState = States.WALK;
                        newDirection = Directions.RIGHT;
                    }
                }
            }
            else
            {
                this.player.setAccelerationX(0);
                this.player.setVelocityX(0);
            }
    
            if(cursors.space.isDown)
            {
                newState = States.ATTACK;
            }
    
            if(cursors.up.isDown)
            {
                
                if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
                else if(this.playerOnFloor())
                {
                    newState = States.JUMP;
                }
            }
            if(cursors.down.isDown)
            {
                this.TileComponent.startMining("down");
                
                if(this.scene.miningCooldown && this.scene.currentMiningDirection == "down" && this.playerOnFloor())
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if(this.PlayerStateManager.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
    
            if(!newState)
            {
                if(!this.playerOnFloor())
                {
                    newState = States.FALL;
                }
                else
                {
                    newState = States.IDLE;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
        
    }
}