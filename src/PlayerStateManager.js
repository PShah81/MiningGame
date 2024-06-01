import {Idle, Walk, Run, Mine, Jump, Fall, Land, Craft, Climb} from './PlayerStateClasses';
class PlayerStateManager
{
    constructor(scene, player, TileComponent)
    {
        this.TileComponent = TileComponent;
        this.player = player;
        this.scene = scene;
        this.acted = false;
        this.states = [
            new Idle(this.player, this.scene, this.TileComponent, this), 
            new Walk(this.player, this.scene, this.TileComponent, this),
            new Run(this.player, this.scene, this.TileComponent, this), 
            new Mine(this.player, this.scene, this.TileComponent, this),
            new Jump(this.player, this.scene, this.TileComponent, this), 
            new Fall(this.player, this.scene, this.TileComponent, this),
            new Land(this.player, this.scene, this.TileComponent, this),
            new Craft(this.player, this.scene, this.TileComponent, this),
            new Climb(this.player, this.scene, this.TileComponent, this)
        ];
        this.currentState = this.states[0];
        this.currentDirection = null;
        this.currentState.enter();
    }
    update(cursors, lastKeyPressed)
    {
        if(!(this.currentState instanceof Idle))
        {
            console.log(this.currentState)
        }
        this.acted = false;
        this.currentState.update(cursors, lastKeyPressed);
    }
    changeState(state, direction)
    {
        this.acted = true;
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

export default PlayerStateManager