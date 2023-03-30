import Phaser from "./lib/phaser.js";
import Game from "./scenes/Game.js";

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    title: "Moving Forward",
    pixelArt: true,
    scene: Game,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 },
            debug: true
        }
    }
})