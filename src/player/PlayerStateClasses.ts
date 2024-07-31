import PlayerStateManager from "./PlayerStateManager.ts";
import Player from "./Player.ts";
import GroundLayer from "../map/GroundLayer.ts";
import ItemLayer from "../map/ItemLayer.ts";

export enum States{
    IDLE = 0,
    WALK = 1,
    RUN = 2,
    MINE = 3,
    JUMP = 4,
    FALL = 5,
    LAND = 6,
    CLIMB = 7,
    ATTACK = 8,
    HURT = 9,
    DEATH = 10,
    WIN = 11
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
    DYNAMITE = 2,
    POTION = 3
}
export enum GoldCost {
    LADDER = -0.5,
    TORCH = -1,
    DYNAMITE = -2,
    POTION = -5
}



export class PlayerState {
    player: Player
    PlayerStateManager: PlayerStateManager
    direction?: Directions
    finishedAnimation: Boolean
    GroundLayer: GroundLayer
    ItemLayer: ItemLayer
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        this.player = player;
        this.PlayerStateManager = PlayerStateManager;
        this.finishedAnimation = false;
        this.GroundLayer = GroundLayer;
        this.ItemLayer = ItemLayer;
    }

    enter(direction: Directions) {}
    exit(exitState: States) {}
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer) {}
    moveHorizontally(direction: Directions)
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
    handleKeyPress(lastKeyPressed?: integer)
    {
        if(lastKeyPressed)
        {
            this.craftItem(lastKeyPressed);
            this.removeItem(lastKeyPressed);
        }
    }
    craftItem(lastKeyPressed: integer)
    {
        let item = -1;
        let goldCost = 0;
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.ONE)
        {
            item = Items.LADDER;
            goldCost = GoldCost.LADDER;
        }
        else if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.TWO)
        {
            item = Items.TORCH;
            goldCost = GoldCost.TORCH;
        }
        else if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.THREE)
        {
            item = Items.DYNAMITE;
            goldCost = GoldCost.DYNAMITE;
        }
        else if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.FOUR)
        {
            item = Items.POTION;
            goldCost = GoldCost.POTION;
        }
        if(item != -1 && this.player.gold + goldCost >= 0)
        {
            if(item == Items.LADDER)
            {
                let placed = this.ItemLayer.placeItem(item, this.player);
                if(placed)
                {
                    this.player.scene.updateGold(goldCost);
                }
            }
            else if(item == Items.TORCH)
            {
                let placed = this.ItemLayer.placeItem(item, this.player);
                if(placed)
                {
                    this.player.scene.updateGold(goldCost);
                }
            }
            else if(item == Items.DYNAMITE)
            {
                this.GroundLayer.handleDynamite();   
                this.player.scene.updateGold(goldCost);
            }
            else if(item == Items.POTION)
            {
                let changed = this.player.changeHealth(0.5 * this.player.maxHealth);
                if(changed)
                {
                    this.player.scene.updateGold(goldCost);
                }
            }
        }
    }
    removeItem(lastKeyPressed: integer)
    {
        if(lastKeyPressed == Phaser.Input.Keyboard.KeyCodes.Q)
        {
            this.ItemLayer.removeItem(this.player);
        }
    }
    playerOnFloor()
    {
        if(this.player.body)
        {
            if(this.player.body instanceof Phaser.Physics.Arcade.Body && this.player.body.onFloor())
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            console.error("No Body");
            return false;
        }
    }
    getPlayerVelocity()
    {
        if(this.player.body)
        {
            return this.player.body.velocity;
        }
        else
        {
            console.error("No Body");
            return new Phaser.Math.Vector2(0,0);
        }
    }
    stopMineCheck(cursors: Phaser.Types.Input.Keyboard.CursorKeys, newState: States)
    {
        if(cursors.left.isDown || cursors.right.isDown || cursors.down.isDown)
        {
            if(newState != States.MINE)
            {
                this.GroundLayer.stopMining();
            }
        }
    }
}

export class Idle extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }
    enter(direction: Directions)
    {
        this.player.anims.play("idle", true);
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        this.player.setAccelerationX(0);
        this.player.setAccelerationY(0);
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        this.handleKeyPress(lastKeyPressed);

        
        if (cursors.left.isDown)
        {
            this.GroundLayer.startMining("left");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            this.GroundLayer.startMining("right");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
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
            this.GroundLayer.startMining("down");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }
        this.stopMineCheck(cursors,newState);
        
        this.PlayerStateManager.changeState(newState, newDirection);
    }
}

export class Walk extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
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
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;
        let velocity = this.getPlayerVelocity();

        this.handleKeyPress(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.GroundLayer.startMining("left");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            this.GroundLayer.startMining("right");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
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
            this.GroundLayer.startMining("down");
            
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        this.stopMineCheck(cursors,newState);
        
        if(newState == States.IDLE)
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
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
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
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;
        let velocity = this.getPlayerVelocity();

        this.handleKeyPress(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.GroundLayer.startMining("left");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            this.GroundLayer.startMining("right");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
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
            this.GroundLayer.startMining("down");
            
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        this.stopMineCheck(cursors,newState);
    
        
        if(newState == States.IDLE)
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
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
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
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        // If we've changed our mining direction or we're mining a different tile than the one we initially were, stop mining
        if(this.GroundLayer.currentMiningDirection && this.GroundLayer.miningTile)
        {
            let tile = this.GroundLayer.checkTileCollision(this.GroundLayer.currentMiningDirection, this.player);

            if (!tile || (tile && (tile.x != this.GroundLayer.miningTile.x || tile.y != this.GroundLayer.miningTile.y)))
            {
                this.GroundLayer.stopMining();
            }
        }

        if (cursors.left.isDown)
        {
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
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
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
            {
                newState = States.MINE;
                newDirection = Directions.DOWN;
            }
            else if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        this.stopMineCheck(cursors,newState);
    
        

        if(newState == States.IDLE)
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
        this.GroundLayer.stopMining();
    }
}

export class Jump extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.player.setVelocityY(-250);
        this.finishedAnimation = false;
        this.player.anims.play("jump", true).on('animationcomplete-jump', 
        ()=>{this.finishedAnimation = true}, this);
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        this.handleKeyPress(lastKeyPressed);

        if(this.finishedAnimation)
        {
            if(cursors.left.isDown)
            {
                this.GroundLayer.startMining("left");
                this.moveHorizontally(Directions.LEFT);
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
                {
                    newState = States.MINE;
                    newDirection = Directions.LEFT;
                }
            }
            else if(cursors.right.isDown)
            {
                this.GroundLayer.startMining("right");
                this.moveHorizontally(Directions.RIGHT);
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
                if(this.player.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.UP;
                }
            }
            if(cursors.down.isDown)
            {
                if(this.player.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }

            this.stopMineCheck(cursors,newState);
        
            
            

            if(newState == States.IDLE)
            {
                if(!this.playerOnFloor())
                {
                    newState = States.FALL;
                }
                else
                {
                    newState = States.LAND;
                }
            }
            this.PlayerStateManager.changeState(newState, newDirection);
        }
    }
}

export class Fall extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.player.setAccelerationX(0);
        this.player.anims.play("fall", true);
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        this.handleKeyPress(lastKeyPressed);

        if (cursors.left.isDown)
        {
            this.GroundLayer.startMining("left");
            this.moveHorizontally(Directions.LEFT);
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
            {
                newState = States.MINE;
                newDirection = Directions.LEFT;
            }
        }
        else if (cursors.right.isDown)
        {
            this.GroundLayer.startMining("right");
            this.moveHorizontally(Directions.RIGHT);
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.UP;
            }
        }
        if(cursors.down.isDown)
        {
            if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        if(this.playerOnFloor())
        {
            newState = States.LAND;
        }

        this.stopMineCheck(cursors,newState);
    
        

        if(newState == States.IDLE)
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
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.finishedAnimation = false;
        this.player.anims.play("land", true).on('animationcomplete-land', 
        ()=>{this.finishedAnimation = true}, this);
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        this.handleKeyPress(lastKeyPressed);

        if(this.finishedAnimation)
        {
            if (cursors.left.isDown)
            {
                this.GroundLayer.startMining("left");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
                this.GroundLayer.startMining("right");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
                
                if(this.player.canClimb)
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
                this.GroundLayer.startMining("down");
                
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if(this.player.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }

            this.stopMineCheck(cursors,newState);
        
            
            
            if(newState == States.IDLE)
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
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
        this.currentFrame = null;
    }

    enter(direction: Directions)
    {
        this.direction = direction;
        if(this.player.body && this.player.body instanceof Phaser.Physics.Arcade.Body)
        {
            this.player.body.setAllowGravity(false);
        }

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
                this.currentFrame = this.player.anims.currentFrame.index - 1;
                this.player.anims.pause();
            }
            else
            {
                this.player.anims.play("climbIdle")
            }
            this.player.setVelocityY(0);
        }
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let velocity = this.getPlayerVelocity();
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        this.handleKeyPress(lastKeyPressed);


        if (cursors.left.isDown)
        {
            this.moveHorizontally(Directions.LEFT);
            this.GroundLayer.startMining("left");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            this.GroundLayer.startMining("right");
            if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
            if(this.player.canClimb)
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
                this.GroundLayer.startMining("down");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down")
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
            }
            else if(this.player.canClimb)
            {
                newState = States.CLIMB;
                newDirection = Directions.DOWN;
            }
        }

        this.stopMineCheck(cursors, newState);
    
        

        if(newState == States.IDLE)
        {
            if(this.player.canClimb && !this.playerOnFloor())
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

    exit(exitState: States)
    {
        if(exitState != States.CLIMB)
        {
            if(this.player.body && this.player.body instanceof Phaser.Physics.Arcade.Body)
            {
                this.player.body.setAllowGravity(true);
            }
        }
    }
}

export class Attack extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.finishedAnimation = false;
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.attackHitBox.body.enable = true;
        this.player.anims.play("attack", true).on('animationcomplete-attack', 
        ()=>{this.finishedAnimation = true}, this);
        
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        if(this.finishedAnimation)
        {
            if (cursors.left.isDown)
            {
                this.GroundLayer.startMining("left");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            else if (cursors.right.isDown)
            {
                this.GroundLayer.startMining("right");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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

            if(cursors.up.isDown)
            {
                if(this.player.canClimb)
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
                this.GroundLayer.startMining("down");
                
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if(this.player.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
    
            this.stopMineCheck(cursors, newState);
        
            
            if(newState == States.IDLE)
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
    exit(exitState: States) {
        this.player.attackHitBox.body.enable = false;
        this.player.enemiesHit.clear();
    }
}

export class Hurt extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.finishedAnimation = false;
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.anims.play("hurt", true).on('animationcomplete-hurt', 
        this.handleHurtEnd, this);    
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let newState = States.IDLE;
        let newDirection = Directions.IDLE;

        if(this.finishedAnimation)
        {
            if (cursors.left.isDown)
            {
                this.GroundLayer.startMining("left");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "left")
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
            else if (cursors.right.isDown)
            {
                this.GroundLayer.startMining("right");
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "right")
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
                if(this.player.canClimb)
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
                this.GroundLayer.startMining("down");
                
                if(this.GroundLayer.miningCooldown && this.GroundLayer.currentMiningDirection == "down" && this.playerOnFloor())
                {
                    newState = States.MINE;
                    newDirection = Directions.DOWN;
                }
                else if(this.player.canClimb)
                {
                    newState = States.CLIMB;
                    newDirection = Directions.DOWN;
                }
            }
    
            this.stopMineCheck(cursors, newState);
        
            
            if(newState == States.IDLE)
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

    handleHurtEnd()
    {
        if(this.player.health <= 0)
        {
            this.PlayerStateManager.changeState(States.DEATH, Directions.IDLE);
        }
        else
        {
            this.finishedAnimation = true
        }
    }
}

export class Death extends PlayerState {
    constructor(player: Player, PlayerStateManager: PlayerStateManager, 
        GroundLayer: GroundLayer, ItemLayer: ItemLayer) {
        super(player, PlayerStateManager, GroundLayer, ItemLayer);
    }

    enter(direction: Directions)
    {
        this.player.setVelocityX(0);
        this.player.setAccelerationX(0);
        this.player.anims.play("death", true).on('animationcomplete-death', 
        ()=>{this.player.scene.gameOver(false)}, this);    
    }
}

export class Win extends PlayerState {

    enter(direction: Directions)
    {
        this.player.scene.gameOver(true);
    }

}