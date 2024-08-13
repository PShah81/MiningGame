import Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import GameScene from './GameScene.ts';
import PauseScene from './PauseScene.ts';
import GameOverScene from './GameOverScene.ts';
import LeaderboardScene from './LeaderboardScene.ts';
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 2900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 }
        }
    },
    render: {
        pixelArt: true
    },
    scene: [GameScene, PauseScene, GameOverScene, LeaderboardScene],
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        },
        ]
    }
}

export default new Phaser.Game(config)