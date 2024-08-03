import Player from "../player/Player.ts";
import ReaperStateManager from "./ReaperStateManager.ts";
import Reaper from "./Reaper.ts";
export enum States{
    IDLE = 0,
    FLOAT = 1,
    TELEPORT = 2,
    ATTACK = 3,
    DEATH = 4
}
export enum Directions {
    LEFT = 0,
    RIGHT = 1,
    IDLE = 2
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
    enter(direction: Directions){}
    update() {}
    exit(exitState: States) {}
    findFollowDirection()
    {
        if(this.player.body && this.reaper.body)
        {
            let playerPos = this.player.body.center;
            let reaperPos = this.reaper.body.center;

            let direction = Directions.IDLE;
            let xDifference = playerPos.x - reaperPos.x;
            let threshold = 1;
            if(xDifference < threshold)
            {
                direction = Directions.LEFT;
            }
            else if(xDifference > threshold)
            {
                direction = Directions.RIGHT;
            }
            else
            {
                direction = Directions.IDLE;
            }
            return direction;
        }
        else
        {
            console.error("No player or reaper body");
            return Directions.IDLE;
        }
    }
    moveHorizontally(direction: Directions)
    {
        this.reaper.setAccelerationX(0);
        if(direction == Directions.RIGHT)
        {
            this.reaper.setFlipX(true);
            this.reaper.setVelocityX(30);
        }
        else if(direction == Directions.LEFT)
        {
            this.reaper.setFlipX(false);
            this.reaper.setVelocityX(-30);
        }
        else
        {
            this.reaper.setVelocityX(0);
        }
    }
}

export class Idle extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.reaper.setVelocityX(0);
        this.reaper.anims.play("reaper_idle", true);
    }
    update()
    {
        let state = States.IDLE;
        let direction = this.findFollowDirection();
        if(direction != Directions.IDLE)
        {
            state = States.FLOAT;
        }
        // this.reaperStateManager.changeState(state, direction);
    }
}

export class Float extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.moveHorizontally(direction);
        this.reaper.anims.play("reaper_walk", true);
        
    }
    update()
    {
        let state = States.IDLE;
        let direction = this.findFollowDirection();
        this.reaperStateManager.changeState(state, direction);
    }
}

export class Teleport extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.moveHorizontally(direction);
        this.reaper.anims.play("reaper_walk", true);
        
    }
    update()
    {
        let state = States.IDLE;
        let direction = this.findFollowDirection();

        this.reaperStateManager.changeState(state, direction);
    }
}

export class Attack extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.moveHorizontally(direction);
        this.reaper.anims.play("reaper_walk", true);
        
    }
    update()
    {
        let state = States.IDLE;
        let direction = this.findFollowDirection();

        this.reaperStateManager.changeState(state, direction);
    }
}

export class Summon extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.moveHorizontally(direction);
        this.reaper.anims.play("reaper_walk", true);
        
    }
    update()
    {
        let state = States.IDLE;
        let direction = this.findFollowDirection();

        this.reaperStateManager.changeState(state, direction);
    }
}

export class Death extends ReaperState {
    constructor(player: Player, reaper: Reaper, reaperStateManager: ReaperStateManager) {
        super(player, reaper, reaperStateManager);
    }
    enter(direction: Directions)
    {
        this.reaper.anims.play("reaper_death", true).on('animationcomplete-reaper_death', 
        ()=>{this.reaper.destroy()}, this);
    }
}