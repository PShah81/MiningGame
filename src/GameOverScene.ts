import { Game } from "phaser";
import GameScene from "./GameScene";

export default class GameOverScene extends Phaser.Scene {
    
    options!: String[]
    selectedOption!: number
    yesText!: Phaser.GameObjects.Text
    noText!: Phaser.GameObjects.Text
    elapsedTime!: number
    enemiesDefeated!: number
    score !: number
    constructor() {
        super('GameOverScene');
    }

    create(data: {elapsedTime: number, enemiesDefeated: number, score: number}) {
        this.elapsedTime = data.elapsedTime;
        this.enemiesDefeated = data.enemiesDefeated;
        this.score = data.score;
        this.scene.bringToTop();
        this.options = ['Yes', 'No'];
        this.selectedOption = 0;
        this.add.text(window.innerWidth/2, 150, 'Game Over', { fontSize: '32px'}).setOrigin(0.5).setColor("#FF0000");
        this.add.text(window.innerWidth/2, 200, 'Play again?', { fontSize: '24px'}).setOrigin(0.5).setColor("#FF0000");3


        this.yesText = this.add.text(window.innerWidth/2 - 50, 250, 'Yes', { fontSize: '24px' }).setOrigin(0.5);
        this.noText = this.add.text(window.innerWidth/2 + 50, 250, 'No', { fontSize: '24px'}).setOrigin(0.5);

        if(this.input.keyboard)
        {
            this.input.keyboard.on('keydown-LEFT', this.moveLeft, this);
            this.input.keyboard.on('keydown-RIGHT', this.moveRight, this);
            this.input.keyboard.on('keydown-ENTER', this.selectOption, this);
        }

        this.updateSelection();
    }

    moveLeft() {
        this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        this.updateSelection();
    }

    moveRight() {
        this.selectedOption = (this.selectedOption + 1) % this.options.length;
        this.updateSelection();
    }

    updateSelection() {
        if (this.selectedOption === 0) {
            this.yesText.setStyle({ fill: '#0f0' });
            this.noText.setStyle({ fill: '#fff' });
        } else {
            this.yesText.setStyle({ fill: '#fff' });
            this.noText.setStyle({ fill: '#f00' });
        }
    }

    selectOption() {
        if (this.selectedOption === 0) {
            this.scene.stop();
            this.scene.remove("GameScene");
            this.scene.add("GameScene", new GameScene(), true);
        } else {
            this.scene.start("StatsScene", {elapsedTime: this.elapsedTime, enemiesDefeated: this.enemiesDefeated, score: this.score});
        }
    }
}


