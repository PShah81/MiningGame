import {SlimeState, Directions, States, Idle, Walk, Jump, Fall, Land, Attack, Death} from './SlimeStateClasses';
import Slime from './Slime';
import Player from '../player/Player';
export default class SlimeStateManager
{
    slime: Slime
    player: Player
    states: SlimeState[]
    currentState: SlimeState
    currentDirection: Directions
    constructor(slime: Slime, player: Player)
    {
        this.slime = slime;
        this.player = player;
        this.states = [
            new Idle(this.player, this.slime, this),
            new Walk(this.player, this.slime, this),
            new Jump(this.player, this.slime, this),
            new Fall(this.player, this.slime, this),
            new Land(this.player, this.slime, this),
            new Attack(this.player, this.slime, this),
            new Death(this.player, this.slime, this)
        ];
        this.currentDirection = Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(Directions.IDLE);
        
    }
    update()
    {
        if(this.slime.health <= 0)
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