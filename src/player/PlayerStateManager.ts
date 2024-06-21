import GameScene from '../GameScene';
import GroundLayer from '../map/GroundLayer';
import ItemLayer from '../map/ItemLayer';
import Player from './Player';
import {PlayerState, Idle, Walk, Run, Mine, Jump, Fall, Land, Climb, Attack, Directions} from './PlayerStateClasses';
class PlayerStateManager
{
    player: Player
    states: PlayerState[]
    currentState: PlayerState
    currentDirection?: Directions
    GroundLayer: GroundLayer
    ItemLayer: ItemLayer
    constructor(player, GroundLayer, ItemLayer)
    {
        this.GroundLayer = GroundLayer;
        this.ItemLayer = ItemLayer;
        this.player = player;
        this.states = [
            new Idle(this.player,this, this.GroundLayer, this.ItemLayer), 
            new Walk(this.player, this, this.GroundLayer, this.ItemLayer),
            new Run(this.player, this, this.GroundLayer, this.ItemLayer), 
            new Mine(this.player, this, this.GroundLayer, this.ItemLayer),
            new Jump(this.player, this, this.GroundLayer, this.ItemLayer), 
            new Fall(this.player, this, this.GroundLayer, this.ItemLayer),
            new Land(this.player, this, this.GroundLayer, this.ItemLayer),
            new Climb(this.player, this, this.GroundLayer, this.ItemLayer),
            new Attack(this.player, this, this.GroundLayer, this.ItemLayer)
        ];
        this.currentState = this.states[0];
        this.currentState.enter(this.currentDirection);
        
    }
    update(cursors, lastKeyPressed)
    {
        this.currentState.update(cursors, lastKeyPressed);
        this.updateHitboxPosition();
    }
    changeState(state, direction)
    {
        this.updateHitboxPosition();
        this.player.canClimb = false;
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
    updateHitboxPosition = () => 
    {
        if(this.player.body)
        {
            this.player.attackHitBox.x = this.player.flipX
            ? this.player.body.x - this.player.body.width * 0.55
            : this.player.body.x + this.player.body.width * 1.5 
            this.player.attackHitBox.y = this.player.body.y + this.player.body.height * 0.5;
        }
        
    }
}

export default PlayerStateManager