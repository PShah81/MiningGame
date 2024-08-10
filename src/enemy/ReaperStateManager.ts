import {ReaperState, Directions, States, Idle, Death, Attack, Teleport, Summon, Float} from './ReaperStateClasses.ts';
import Reaper from './Reaper.ts';
import Player from '../player/Player.ts';
export default class ReaperStateManager
{
    reaper: Reaper
    player: Player
    states: ReaperState[]
    currentState: ReaperState
    canAttack: boolean
    summoner: Phaser.Time.TimerEvent
    constructor(reaper: Reaper, player: Player)
    {
        this.canAttack = true;
        this.reaper = reaper;
        this.player = player;
        this.states = [
            new Idle(this.player, this.reaper, this),
            new Float(this.player, this.reaper, this),
            new Teleport(this.player, this.reaper, this),
            new Summon(this.player, this.reaper, this),
            new Attack(this.player, this.reaper, this),
            new Death(this.player, this.reaper, this)
        ];
        this.currentState = this.states[0];
        this.currentState.enter();

        this.summoner = this.player.scene.time.addEvent({
            delay: 20000,
            callback: () => {   
                this.changeState(States.SUMMON);
            },
            callbackScope: this,
            loop: true
        })
    }
    update()
    {
        this.followReaper();
        this.currentState.update();
        this.updateHitboxPosition();
    }
    changeState(state: States)
    {
        let newState = this.states[state];
        if(newState != this.currentState)
        {
            this.currentState.exit(state);
            this.currentState = newState;
            this.currentState.enter();

        }

    }

    followReaper()
    {
        if(this.reaper.body)
        {
            let distance = 30;
            let reaperPos = this.reaper.body.center;
            let positions = [[reaperPos.x - distance, reaperPos.y + distance], [reaperPos.x + distance, reaperPos.y + distance], [reaperPos.x - distance, reaperPos.y - distance], [reaperPos.x + distance, reaperPos.y - distance]];
            for(let i = 0; i < positions.length; i++)
            {
                let spirit = this.reaper.spiritArr[i];
                let [x, y] = positions[i];
                spirit.x = x;
                spirit.y = y;
            }
        }
    }

    updateHitboxPosition = () => 
    {
        if(this.reaper.body)
        {
            let centerVec = this.reaper.body.center; 
            this.reaper.attackHitBox.x = this.reaper.flipX
            ? centerVec.x - this.reaper.body.width * 0.3
            : centerVec.x + this.reaper.body.width * 0.3
            this.reaper.attackHitBox.y = centerVec.y; 
        }
        
    }

    destroy = () => {
        for (let spirit of this.reaper.spiritArr)
        {
            spirit.anims.play("spirit_disappear", true);
            spirit.visible = false;
        }
        this.reaper.destroy();
        this.summoner.destroy();
    }
}