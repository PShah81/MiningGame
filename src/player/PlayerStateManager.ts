import GroundLayer from '../map/GroundLayer.ts';
import ItemLayer from '../map/ItemLayer.ts';
import Player from './Player.ts';
import {PlayerState, Idle, Walk, Run, Mine, Jump, Fall, Land, Climb, Attack, Hurt, Directions, States, Death, Win} from './PlayerStateClasses.ts';
class PlayerStateManager
{
    player: Player
    states: PlayerState[]
    currentState: PlayerState
    currentDirection: Directions
    GroundLayer: GroundLayer
    ItemLayer: ItemLayer
    constructor(player: Player, GroundLayer: GroundLayer, ItemLayer: ItemLayer)
    {
        this.GroundLayer = GroundLayer;
        this.ItemLayer = ItemLayer;
        this.player = player;
        this.states = [
            new Idle(this.player, this, this.GroundLayer, this.ItemLayer), 
            new Walk(this.player, this, this.GroundLayer, this.ItemLayer),
            new Run(this.player, this, this.GroundLayer, this.ItemLayer), 
            new Mine(this.player, this, this.GroundLayer, this.ItemLayer),
            new Jump(this.player, this, this.GroundLayer, this.ItemLayer), 
            new Fall(this.player, this, this.GroundLayer, this.ItemLayer),
            new Land(this.player, this, this.GroundLayer, this.ItemLayer),
            new Climb(this.player, this, this.GroundLayer, this.ItemLayer),
            new Attack(this.player, this, this.GroundLayer, this.ItemLayer),
            new Hurt(this.player, this, this.GroundLayer, this.ItemLayer),
            new Death(this.player, this, this.GroundLayer, this.ItemLayer),
            new Win(this.player, this, this.GroundLayer, this.ItemLayer)
        ];
        this.currentDirection = Directions.IDLE;
        this.currentState = this.states[0];
        this.currentState.enter(Directions.IDLE);
        
    }
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, lastKeyPressed?: integer)
    {
        let tileAtPlayer = this.GroundLayer.getTilePosAtObject(this.player);
        if(tileAtPlayer && tileAtPlayer.y + 1 == this.GroundLayer.layer.tilemap.height)
        {
            this.changeState(States.WIN, Directions.IDLE);
        }
        this.currentState.update(cursors, lastKeyPressed);
        this.updateHitboxPosition();
    }
    changeState(state: States, direction: Directions)
    {
        this.updateHitboxPosition();
        //If no longer overlapping with ladder set can climb to false
        if(!this.player.scene.physics.world.overlap(this.player, this.ItemLayer.layer, this.ItemLayer.canClimb))
        {
            this.player.canClimb = false;
        }
        let newState = this.states[state];
        newState.direction = direction;
        // As long as something is different allow state change
        if(newState != this.currentState || direction != this.currentDirection)
        {
            // If in death state nothing can be changed
            if(this.currentState != this.states[States.DEATH])
            {          
                this.currentState.exit(state);
                this.currentState = newState;
                this.currentDirection = direction;
                this.currentState.enter(direction);
            }
        }

    }
    updateHitboxPosition = () => 
    {
        if(this.player.body)
        {
            let centerVec = this.player.body.center; 
            this.player.attackHitBox.x = this.player.flipX
            ? centerVec.x - this.player.body.width * 0.9
            : centerVec.x + this.player.body.width * 0.9
            this.player.attackHitBox.y = centerVec.y; 
        }
        
    }
}

export default PlayerStateManager