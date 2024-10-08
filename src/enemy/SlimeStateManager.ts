import {SlimeState, Directions, States, Idle, Walk, Jump, Fall, Land, Death} from './SlimeStateClasses.ts';
import Slime from './Slime.ts';
import Player from '../player/Player.ts';
export default class SlimeStateManager
{
    slime: Slime
    player: Player
    states: SlimeState[]
    currentState: SlimeState
    currentDirection: Directions
    canAttack: boolean
    constructor(slime: Slime, player: Player)
    {
        this.canAttack = true;
        this.slime = slime;
        this.player = player;
        this.states = [
            new Idle(this.player, this.slime, this),
            new Walk(this.player, this.slime, this),
            new Jump(this.player, this.slime, this),
            new Fall(this.player, this.slime, this),
            new Land(this.player, this.slime, this),
            new Death(this.player, this.slime, this)
        ];
        this.currentDirection = Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(Directions.IDLE);
        
    }
    update()
    {
        this.currentState.update();
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