import {ReaperState, Directions, States, Idle, Death, Attack, Teleport, Summon, Float} from './ReaperStateClasses.ts';
import Reaper from './Reaper.ts';
import Player from '../player/Player.ts';
export default class ReaperStateManager
{
    reaper: Reaper
    player: Player
    states: ReaperState[]
    currentState: ReaperState
    currentDirection: Directions
    canAttack: boolean
    constructor(reaper: Reaper, player: Player)
    {
        this.canAttack = true;
        this.reaper = reaper;
        this.player = player;
        this.states = [
            new Idle(this.player, this.reaper, this),
            // new Float(this.player, this.reaper, this),
            // new Teleport(this.player, this.reaper, this),
            // new Attack(this.player, this.slime, this),
            // new Summon(this.player, this.reaper, this),
            // new Death(this.player, this.slime, this),
        ];
        this.currentDirection = Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(Directions.IDLE);
        
    }
    update()
    {
        if(this.reaper.health <= 0)
        {
            this.changeState(States.DEATH, Directions.IDLE);
        }
        else
        {
            this.currentState.update();
        }
    }
    changeState(state: States, direction: Directions)
    {
        let newState = this.states[state];
        newState.direction = direction;
        if(newState != this.currentState || direction != this.currentDirection)
        {
            this.currentState.exit(state);
            this.currentState = newState;
            this.currentDirection = direction;
            this.currentState.enter(direction);

        }

    }
}