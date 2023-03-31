import Phaser from "../lib/phaser.js";

export default class Game extends Phaser.Scene {
    /**
     * @type {Phaser.Types.Input.Keyboard.CursorKeys}
     */
    cursors;
    
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
        //KEYBOARD
        this.cursors = this.input.keyboard.createCursorKeys();

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
        this.cameras.main.setDeadzone(this.scale.width * 1.5);
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

        // KEYBOARD
        if (this.cursors.left.isDown && !touchingDown)
        {
            this.player.setVelocityX(-200);
        }
        else if (this.cursors.right.isDown && !touchingDown)
        {
            this.player.setVelocityX(200);
        }
        else {
            this.player.setVelocityX(0);
        }

        this.horizontalWrap(this.player);
    }

    /**
     * 
     * @param {Phaser.GameObjects.Sprite} sprite
     * @description Make an object wraps horizontally around the screen (e.g leaving the screen through the left makes the object reenter the screen through the right) 
     */
    horizontalWrap(sprite)
    {
        const halfWidth = sprite.displayWidth / 2;

        if (sprite.x < -halfWidth)
        {
            sprite.x = this.scale.width + halfWidth;
        }
        else if (sprite.x > this.scale.width + halfWidth)
        {
            sprite.x = -halfWidth;
        }
    }
}