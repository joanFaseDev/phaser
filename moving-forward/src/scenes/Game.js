import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene {
    /**
     * @type {number}
     * @description Center of the screen for the horizontal axis
     */
    midScreenX;

    /**
     * @type {number}
     * @description Center of the screen for the vertical axis
     */
    midScreenY;

    /**
     * @type {Phaser.Physics.Arcade.StaticGroup}
     */
    platforms;

    /**
     * @type {Array}
     * @description Each platfom have a position corresponding to a predefined y coordinate
     */
    positions;

    /**
     * @type {Object}
     * @description Each platfom have a size corresponding to a preloaded image
     */
    sizes;

    constructor()
    {
        super('game');
    }

    preload()
    {
        this.midScreenX = this.scale.width / 2;
        this.midScreenY = this.scale.height / 2;

        this.positions = [100, 200, 400];

        this.sizes = {
            'small': 'platform-small',
            'medium': 'platform-medium',
            'large': 'platform-large'
        }

        this.load.setBaseURL('./assets/');

        this.load.image('background', 'background.png');
        this.load.image('platform-small', 'platform-small.png');
        this.load.image('platform-medium', 'platform-medium.png');
        this.load.image('platform-large', 'platform-large.png');
        this.load.image('player', 'player.png');
        this.load.image('projectile', 'projectile.png');
    }

    create()
    {
        this.add.image(this.midScreenX, this.midScreenY, 'background').setScrollFactor(0);

        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 5; i++)
        {
            const x = i * 260;
            const y = this.positions[Math.floor(Math.random() * 3)];
            const size = Object.keys(this.sizes)[Math.floor(Math.random() * 3)];
            
            console.log(x, y, size);

            /**
             * @type {Phaser.GameObjects.Image}
             */
            const platform = this.platforms.create(x, y, this.sizes[size]);
            platform.setScale(1.5);
            platform.setOrigin(0);

            /**
             * @type {Phaser.Physics.Arcade.Body}
             */
            const body = platform.body;
            body.updateFromGameObject();
        }
    }

    update()
    {

    }
}