class PlayerActions {
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.player;
    }
    update()
    {
        
        //Animations
        switch (this.scene.actionState) {
            case "leftMine":
            case "rightMine":
            case "downMine":
                this.player.anims.play("mine", true);
                break;
            case "leftWalk":
            case "rightWalk":
                this.player.anims.play("walk", true);
                break;
            case "leftRun":
            case "rightRun":
                this.player.anims.play("run", true);
                break;
            case "jump":
                if(this.scene.lastActionState != this.scene.actionState)
                {
                    this.player.anims.play("jump", true);
                }
                break;
            case "fall":
                if(this.scene.lastActionState != this.scene.actionState)
                {
                    this.player.anims.play("fall", true);
                }
                break;
            case "land":
                if(this.scene.lastActionState != this.scene.actionState)
                {
                    this.player.anims.play("land", true).on('animationcomplete-land', ()=>{this.scene.actionState = "idle"}, this);
                }
                break;
            case "idle":
                this.player.anims.play("idle", true);
            default:
                break;
        }
    }
}

export default PlayerActions