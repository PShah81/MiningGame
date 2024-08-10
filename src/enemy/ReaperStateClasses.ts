import Player from "../player/Player.ts";
import ReaperStateManager from "./ReaperStateManager.ts";
import Reaper from "./Reaper.ts";
import ShakePosition from "phaser3-rex-plugins/plugins/behaviors/shake/ShakePosition";
export enum States{
    IDLE = 0,
    FLOAT = 1,
    TELEPORT = 2,
    SUMMON = 3,
    ATTACK = 4,
    DEATH = 5,
    
}
export enum Directions {
    LEFT = 0,
    RIGHT = 1,
    UP = 2,
    DOWN = 3,
    IDLE = 4
}

export class ReaperState {
    player: Player
    reaper: Reaper
    direction?: Directions
    reaperStateManager: ReaperStateManager
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        this.player = player;
        this.reaper = reaper;
        this.reaperStateManager = reaperStateManager;
    }
    enter(){}
    update() {}
    exit(exitState: States) {}
    findFollowDirection()
    {
        if(this.player.body && this.reaper.body)
        {
            let playerPos = this.player.body.center;
            let reaperPos = this.reaper.body.center;

            let directionX = Directions.IDLE;
            let directionY = Directions.IDLE;
            let xDifference = playerPos.x - reaperPos.x;
            let yDifference = playerPos.y - reaperPos.y;
            let threshold = 50;
            if(xDifference < -1 * threshold)
            {
                directionX = Directions.LEFT;
            }
            else if(xDifference > threshold)
            {
                directionX = Directions.RIGHT;
            }

            if (yDifference < -1 * threshold)
            {
                directionY = Directions.UP;
            }
            else if (yDifference > threshold)
            {
                directionY = Directions.DOWN;
            }


            return [directionX, directionY];
        }
        else
        {
            console.error("No player or reaper body");
            return [Directions.IDLE,Directions.IDLE];
        }
    }
    float(directionX: Directions, directionY: Directions)
    {
        let speed = 50;
        this.reaper.setAccelerationX(0);
        if(directionX == Directions.RIGHT)
        {
            this.reaper.setFlipX(false);
            if (directionY == Directions.DOWN)
            {
                this.reaper.setVelocity(speed, speed);
            }
            else if(directionY == Directions.UP)
            {
                this.reaper.setVelocity(speed, -1 * speed);
            }
            else
            {
                this.reaper.setVelocity(speed, 0);
            }
        }
        else if(directionX == Directions.LEFT)
        {
            this.reaper.setFlipX(true);
            if (directionY == Directions.DOWN)
            {
                this.reaper.setVelocity(-1 *speed, speed);
            }
            else if(directionY == Directions.UP)
            {
                this.reaper.setVelocity(-1 * speed, -1 * speed);
            }
            else
            {
                this.reaper.setVelocity(-1 * speed, 0);
            }
        }
        else
        {
            if (directionY == Directions.DOWN)
            {
                this.reaper.setVelocity(0, speed);
            }
            else if(directionY == Directions.UP)
            {
                this.reaper.setVelocity(0, -1 * speed);
            }
            else
            {
                this.reaper.setVelocity(0, 0);
            }
        }
    }
    canTeleport()
    { 
        if(this.player.body && this.reaper.body)
        {
            let playerPos = this.player.body.center;
            let reaperPos = this.reaper.body.center;
            let xDistance = Math.abs(playerPos.x - reaperPos.x);
            if (xDistance > 200)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
    canAttack()
    {
        if(this.player.body && this.reaper.body)
        {
            let playerPos = this.player.body.center;
            let reaperPos = this.reaper.body.center;
            let xDistance = Math.abs(playerPos.x - reaperPos.x);
            let yDistance = Math.abs(playerPos.y - reaperPos.y);
            if (xDistance < 90 && yDistance < 60 && this.reaperStateManager.canAttack)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}

export class Idle extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter()
    {
        this.reaper.setVelocityX(0);
        this.reaper.anims.play("reaper_idle", true);
    }
    update()
    {
        let state = States.IDLE;
        let [directionX, directionY] = this.findFollowDirection();
        if(this.canAttack())
        {
            state = States.ATTACK;
        }
        else if(directionX != Directions.IDLE || directionY != Directions.IDLE)
        {
            state = States.FLOAT;
        }
        
        this.reaperStateManager.changeState(state);
    }
}

export class Float extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter()
    {
        this.reaper.anims.play("reaper_idle", true);
    }
    update()
    {
        let state = States.IDLE;
        let [directionX, directionY] = this.findFollowDirection();
        this.float(directionX, directionY);
        if(directionX != Directions.IDLE || directionY != Directions.IDLE)
        {
            if(Math.random()*10 < 0.1 && this.canTeleport())
            {
                state = States.TELEPORT;
            }
            else if(this.canAttack())
            {
                state = States.ATTACK;
            }
            else
            {
                state = States.FLOAT;
            }
        }
        this.reaperStateManager.changeState(state);
    }
}

export class Teleport extends ReaperState {
    finishedAnimation: boolean
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
        this.finishedAnimation = false;
    }
    enter()
    {
        this.finishedAnimation = false;
        this.reaper.setVelocity(0);
        this.reaper.anims.play("reaper_teleport", true).on('animationcomplete-reaper_teleport', 
        ()=>{
            this.reaper.setAlpha(0);
            if(this.player.body && this.reaper.body)
            {
                let playerPos = this.player.body.center;
                let reaperPos = this.reaper.body.center;
                let heightDifference = (this.reaper.body.height - this.player.body.height) / 2
                if (reaperPos.x < playerPos.x)
                {
                    this.reaper.setFlipX(true);
                    this.reaper.setPosition(playerPos.x + 100, playerPos.y - heightDifference);
                }
                else
                {
                    this.reaper.setFlipX(false);
                    this.reaper.setPosition(playerPos.x - 100, playerPos.y - heightDifference);
                }
                this.reaper.setAlpha(1);
                this.reaper.anims.play("reaper_appear", true).on('animationcomplete-reaper_appear', () => {
                    this.player.scene.time.addEvent({
                        delay: 500,
                        callback: () => {   
                            this.finishedAnimation = true;
                        },
                        callbackScope: this,
                        loop: false
                    })
                });
            }
        }, this);
        
    }
    update()
    {
        if(this.finishedAnimation)
        {
            let state = States.IDLE;
            let [directionX, directionY] = this.findFollowDirection();
            if(directionX != Directions.IDLE || directionY != Directions.IDLE)
            {
                state = States.FLOAT;
            }

            this.reaperStateManager.changeState(state);
        }

    }
}

export class Attack extends ReaperState {
    finishedAnimation: boolean
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
        this.finishedAnimation = false;
    }
    enter()
    {
        this.reaper.setVelocity(0);
        this.reaper.attackHitBox.body.enable = true;
        this.finishedAnimation = false;
        this.reaper.anims.play("reaper_attack", true).on('animationcomplete-reaper_attack', () => {
            this.finishedAnimation = true;
            this.reaperStateManager.canAttack = false;
        });
    }
    update()
    {
        if(this.finishedAnimation)
        {
            let state = States.IDLE;
            let [directionX, directionY] = this.findFollowDirection();
            if(directionX != Directions.IDLE || directionY != Directions.IDLE)
            {
                state = States.FLOAT;
            }
            this.reaperStateManager.changeState(state);
        }
    }
    exit(exitState: States): void {
        this.reaper.attackHitBox.body.enable = false;
        this.reaper.attacked = false;
        this.reaper.scene.time.addEvent({
            delay: 5000,
            callback: () => {   
                this.reaperStateManager.canAttack = true;
            },
            callbackScope: this,
            loop: false
        })
    }
}

export class Summon extends ReaperState {
    finishedAnimation: boolean
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
        this.finishedAnimation = false;
    }
    enter()
    {
        this.reaper.setVelocity(0);
        this.finishedAnimation = false;
        let spiritArr = this.reaper.spiritArr;
        if (!spiritArr[0].visible)
        {
            for (let spirit of spiritArr)
            {
                spirit.setVisible(true);
                spirit.anims.play("spirit_appear", true).on('animationcomplete-spirit_appear', () => {
                    spirit.anims.play("spirit_idle", true);
                    this.finishedAnimation = true;
                });
            }
        }
        else
        {
            for (let spirit of spiritArr)
            {
                spirit.anims.play("spirit_disappear", true).on('animationcomplete-spirit_disappear', () => {
                    spirit.setVisible(false);
                    this.finishedAnimation = true;
                });
                
            }
        }
    }
    update()
    {
        if (this.finishedAnimation)
        {
            let state = States.IDLE;
            let [directionX, directionY] = this.findFollowDirection();
            if(directionX != Directions.IDLE || directionY != Directions.IDLE)
            {
                state = States.FLOAT;
            }
            this.reaperStateManager.changeState(state);
        }
    }
}

export class Death extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter()
    {
        this.reaper.anims.play("reaper_death", true).on('animationcomplete-reaper_death', 
        ()=>{this.reaper.destroy()}, this);
    }
}