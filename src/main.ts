import Phaser from 'phaser'

import GameScene from './GameScene'
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 5400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: true
        }
    },
    render: {
        pixelArt: true
    },
    scene: [GameScene]
}

export default new Phaser.Game(config)