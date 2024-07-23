export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        let pauseText = this.add.text(50, 100, 'Game Paused', { fontSize: '32px'});
        let controlsText = this.add.text(90, 200, 'Controls', { fontSize: '24px'});
        let underline = this.add.graphics();
        underline.lineStyle(2, 0xffffff);
        underline.beginPath();
        underline.moveTo(controlsText.x, controlsText.y + controlsText.height);
        underline.lineTo(controlsText.x + controlsText.width, controlsText.y + controlsText.height);
        underline.strokePath();
        let Qtext = this.add.text(25, 250, 'Q: Remove an item', { fontSize: '24px'});
        let Ptext = this.add.text(25, 275, 'P: Pause game', { fontSize: '24px'});
        let oneText = this.add.text(25, 300, '1: Craft Ladder', { fontSize: '24px'});
        let twoText = this.add.text(25, 325, '2: Craft Torch', { fontSize: '24px'});
        let threeText = this.add.text(25, 350, '3: Craft Dynamite', { fontSize: '24px'});
        let fourText = this.add.text(25, 375, '4: Use potion', { fontSize: '24px'});
        let Spacetext = this.add.text(25, 400, 'Space: Attack', { fontSize: '24px'});
        let Arrows = this.add.text(25, 425, '←/→/↓/↑: Move/Mine', { fontSize: '24px'});

        if(this.input.keyboard)
        {
            this.input.keyboard.on('keydown-P', this.resume, this);
        }
        
    }
    resume()
    {
        this.scene.get('GameScene').physics.resume();
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}