import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
export default class StatsScene extends Phaser.Scene {
    stats!: Record<string, number>
    rexUI!: RexUIPlugin
    constructor() {
        super({ key: 'StatsScene' });
    }
    create(data: {elapsedTime: number, enemiesDefeated: number, score: number}) {
        this.stats = data;
        this.scene.bringToTop();
        // Display Game Over
        this.add.text(window.innerWidth/2, 100, 'Game Over', { fontSize: '32px' }).setOrigin(0.5);
        
        // Display Stats
        let statsText = `Enemies Defeated: ${this.stats.enemiesDefeated}\nTime Survived: ${this.stats.elapsedTime}s\nScore: ${this.stats.score}`;
        this.add.text(window.innerWidth/2, 200, statsText, { fontSize: '24px'}).setOrigin(0.5);
        
        // Display Play Again Prompt
        this.add.text(window.innerWidth/2, 300, 'Enter your name: ', { fontSize: '24px'}).setOrigin(0.5);
        
        let inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.style.position = 'absolute';
        inputElement.style.left = '50%';
        inputElement.style.top = '350px';
        inputElement.style.transform = 'translate(-50%, -50%)';
        inputElement.style.width = '175px';
        inputElement.style.height = '15px';
        inputElement.style.outline = 'none';
        inputElement.style.fontFamily = "Open Sans";
        inputElement.style.fontSize = "16px";
        document.body.appendChild(inputElement);

        inputElement.style.whiteSpace = 'normal';
        // Focus on the input element
        inputElement.focus();

        // Add an event listener for the Enter key
        inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.submitInput(inputElement.value);
                inputElement.remove();
            }else if(event.key === " ")
            {
                inputElement.value += " ";
            }
        });

        
    }

    submitInput(value: string) {
        this.scene.start("LeaderboardScene", {name: value, score: this.stats.score});
    }
}


     
        
 

