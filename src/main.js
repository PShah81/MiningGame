"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var phaser_1 = require("phaser");
var ui_plugin_js_1 = require("phaser3-rex-plugins/templates/ui/ui-plugin.js");
var GameScene_1 = require("./GameScene");
var PauseScene_1 = require("./PauseScene");
var config = {
    type: phaser_1.default.AUTO,
    width: 1920,
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
    scene: [GameScene_1.default, PauseScene_1.default],
    plugins: {
        scene: [{
                key: 'rexUI',
                plugin: ui_plugin_js_1.default,
                mapping: 'rexUI'
            },
        ]
    }
};
exports.default = new phaser_1.default.Game(config);
