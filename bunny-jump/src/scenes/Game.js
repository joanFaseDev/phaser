import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene {
    /**
     * @type {Phaser.Physics.Arcade.StaticGroup}
     */
    platforms;
    
    /**
     * @type {Phaser.Physics.Arcade.Sprite}
     */
    player;

    constructor()
    {
        super('game');
    }

    preload()
    {
        this.load.setBaseURL('./assets/');

        this.load.image('background', 'bg_layer1.png');
        this.load.image('platform', 'ground_grass.png');
        this.load.image('bunny-stand', 'bunny1_stand.png'); 
    }

    create()
    {
        //BACKGROUND
        this.add.image(240, 320, 'background').setScrollFactor(1, 0);

        //PLATFORMS
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 5; i++)
        {
            const x = Phaser.Math.Between(80, 400);
            const y = i * 150

            /**
             * @type {Phaser.Physics.Arcade.Sprite}
             */
            const platform = this.platforms.create(x, y, 'platform');
            platform.setScale(0.5);

            /**
             * @type {Phaser.Physics.Arcade.StaticBody}
             */
            const body = platform.body;
            body.updateFromGameObject();
        } 

        //PLAYER
        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);
        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        this.physics.add.collider(this.platforms, this.player);

        //CAMERA
        this.cameras.main.startFollow(this.player);
    }

    update()
    {
        //PLATFORMS
        this.platforms.children.iterate((child) => {
            /**
             * @type {Phaser.Physics.Arcade.Sprite}
             */
            const platform = child;
            const scrollY = this.cameras.main.scrollY;
            if (platform.y >= scrollY + 700)
            {
                platform.y = scrollY - Phaser.Math.Between(50, 100);
                platform.body.updateFromGameObject()
            }
        });

        //PLAYER
        const touchingDown = this.player.body.touching.down;
        if (touchingDown)
        {
            this.player.setVelocityY(-300);
        }
    }
}