import phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {
    constructor()
    {
        super('game-over');
    }

    create()

    {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.add.text(screenWidth * 0.5, screenHeight * 0.5, 'Game Over', { fontSize: 48 })
            .setOrigin(0.5);

        // Once in GameOver scene, press space key to start a new game
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game');
        });
    }
}