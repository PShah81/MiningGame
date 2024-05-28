import Phaser from 'phaser'

import GameScene from './GameScene'
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 6000,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    render: {
        pixelArt: true
    },
    scene: [GameScene]
}

export default new Phaser.Game(config)