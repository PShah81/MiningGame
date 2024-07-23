"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PauseScene = /** @class */ (function (_super) {
    __extends(PauseScene, _super);
    function PauseScene() {
        return _super.call(this, 'PauseScene') || this;
    }
    PauseScene.prototype.create = function () {
        var pauseText = this.add.text(50, 100, 'Game Paused', { fontSize: '32px' });
        var controlsText = this.add.text(90, 200, 'Controls', { fontSize: '24px' });
        var underline = this.add.graphics();
        underline.lineStyle(2, 0xffffff);
        underline.beginPath();
        underline.moveTo(controlsText.x, controlsText.y + controlsText.height);
        underline.lineTo(controlsText.x + controlsText.width, controlsText.y + controlsText.height);
        underline.strokePath();
        var Qtext = this.add.text(25, 250, 'Q: Remove an item', { fontSize: '24px' });
        var Ptext = this.add.text(25, 275, 'P: Pause game', { fontSize: '24px' });
        var oneText = this.add.text(25, 300, '1: Craft Ladder', { fontSize: '24px' });
        var twoText = this.add.text(25, 325, '2: Craft Torch', { fontSize: '24px' });
        var threeText = this.add.text(25, 350, '3: Craft Dynamite', { fontSize: '24px' });
        var fourText = this.add.text(25, 375, '4: Use potion', { fontSize: '24px' });
        var Spacetext = this.add.text(25, 400, 'Space: Attack', { fontSize: '24px' });
        var Arrows = this.add.text(25, 425, '←/→/↓/↑: Move/Mine', { fontSize: '24px' });
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-P', this.resume, this);
        }
    };
    PauseScene.prototype.resume = function () {
        this.scene.get('GameScene').physics.resume();
        this.scene.resume('GameScene');
        this.scene.stop();
    };
    return PauseScene;
}(Phaser.Scene));
exports.default = PauseScene;
