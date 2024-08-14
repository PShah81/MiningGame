// leaderboardScene.ts

import Phaser from 'phaser';
import GameScene from './GameScene';

export default class LeaderboardScene extends Phaser.Scene {
    leaderboard!: { name: string; score: number }[]

    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    preload() {
        // Preload assets if needed
    }

    create(data: {name: string, score:number}) {
        this.scene.bringToTop();
        // Retrieve leaderboard data from localStorage
        this.leaderboard = this.getLeaderboard();

        this.addNewScore(data);
        // Display leaderboard
        this.displayLeaderboard();

        if(this.input.keyboard)
        {
            this.input.keyboard.on('keydown-ENTER', this.startNewGame, this);
        }
    }

    getLeaderboard() {
        const leaderboardData = localStorage.getItem('leaderboard');
        
        return leaderboardData ? JSON.parse(leaderboardData) : [];
    }

    saveLeaderboard() {
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
    }

    displayLeaderboard() {
        const yStart = 100;
        const lineHeight = 30;

        this.add.text(window.innerWidth/2, yStart - 30, 'Leaderboard', { fontSize: '24px'}).setOrigin(0.5);

        //Only display top 10
        for (let index = 0; index < Math.min(10, this.leaderboard.length); index++) {
            const yPosition = yStart + index * lineHeight;
            this.add.text(window.innerWidth/2, yPosition, `${index + 1}. ${this.leaderboard[index].name}   ${this.leaderboard[index].score}`, 
                { fontSize: '20px'})
                .setOrigin(0.5);
        }

        this.add.text(window.innerWidth/2, 500, 'Press Enter to play again', {
            fontSize: '32px',
            align: 'center'
        }).setOrigin(0.5);

    }

    addNewScore(data: {name: string, score: number}) {

        if (data) {
            this.leaderboard.push(data);
            this.leaderboard.sort((a, b) => b.score - a.score); // Sort by score in descending order
            this.saveLeaderboard();
            this.refreshLeaderboard();
        }
    }

    refreshLeaderboard() {
        // Clear current leaderboard display and redraw
        this.children.getAll().forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.destroy();
            }
        });

        this.displayLeaderboard();
    }

    startNewGame()
    {
        this.scene.start("GameScene");
    }
}
