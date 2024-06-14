import GameScene from './GameScene';
import {PlayerState, Idle, Walk, Run, Mine, Jump, Fall, Land, Climb, Attack, Directions} from './PlayerStateClasses';
import TileComponent from './TileComponent';
class PlayerStateManager
{
    scene: GameScene
    player: Phaser.Physics.Arcade.Sprite | null
    TileComponent: TileComponent | null
    canClimb: boolean
    states: PlayerState[]
    currentState: PlayerState
    currentDirection: Directions | null
    constructor(scene, player, TileComponent)
    {
        this.TileComponent = TileComponent;
        this.player = player;
        this.scene = scene;
        this.canClimb = false;
        this.states = [
            new Idle(this.player, this.scene, this.TileComponent, this), 
            new Walk(this.player, this.scene, this.TileComponent, this),
            new Run(this.player, this.scene, this.TileComponent, this), 
            new Mine(this.player, this.scene, this.TileComponent, this),
            new Jump(this.player, this.scene, this.TileComponent, this), 
            new Fall(this.player, this.scene, this.TileComponent, this),
            new Land(this.player, this.scene, this.TileComponent, this),
            new Climb(this.player, this.scene, this.TileComponent, this),
            new Attack(this.player, this.scene, this.TileComponent, this)
        ];
        this.currentState = this.states[0];
        this.currentDirection = null;
        this.currentState.enter(this.currentDirection);
        
    }
    update(cursors, lastKeyPressed)
    {
        this.currentState.update(cursors, lastKeyPressed);
    }
    changeState(state, direction)
    {
        this.canClimb = false;
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