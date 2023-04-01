import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

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

    /**
     * @type {Phaser.Physics.Arcade.Group}
     */
    carrots;
    carrotsCollected = 0;

    /**
     * @type {Phaser.GameObjects.Text}
     */
    score;

    constructor()
    {
        super('game');
    }

    init()
    {
        this.carrotsCollected = 0;
    }

    preload()
    {
        this.load.setBaseURL('./assets/');

        this.load.image('background', 'bg_layer1.png');
        this.load.image('platform', 'ground_grass.png');
        this.load.image('bunny-stand', 'bunny1_stand.png');
        this.load.image('bunny-jump', 'bunny1_jump.png');
        this.load.image('carrot', 'carrot.png');
        
        this.load.audio('jump', 'sfx/phaseJump1.ogg');
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

        //CARROTS
        this.carrots = this.physics.add.group({ classType: Carrot });

        this.physics.add.collider(this.platforms, this.carrots);
        this.physics.add.overlap(this.carrots, this.player, this.handleCollectCarrot, undefined, this);

        //CAMERA
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(this.scale.width * 1.5);

        //SCORE
        /**
         * @type {Phaser.GameObjects.TextStyle}
         */
        const style = { color: '#000', fontSize: 24 };
        this.score = this.add.text(240, 10, 'Carrots: 0', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);
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

                // Add a carrot above the newly created platform
                this.addCarrotAbove(platform);
            }
        });
        
        //PLAYER
        const touchingDown = this.player.body.touching.down;
        if (touchingDown)
        {
            this.player.setVelocityY(-300);
            this.player.setTexture('bunny-jump');
            this.sound.play('jump');
        }

        const velocityY = this.player.body.velocity.y;
        if (velocityY > 0 && this.player.texture.key !== 'bunny-stand')
        {
            this.player.setTexture('bunny-stand');
        }

        //KEYBOARD
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

        //GAME OVER
        const bottomPlatform = this.findBottomMostPlatform();
        if (this.player.y > bottomPlatform.y + 200)
        {
            this.scene.start('game-over');
        }
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

    /**
     * 
     * @param {Phaser.GameObjects.Sprite} sprite 
     * @description Create a Carrot instance on each 'reused' platform
     */
    addCarrotAbove(sprite)
    {
        const y = sprite.y - sprite.displayHeight;

        /**
         * @type {Phaser.Physics.Arcade.Sprite}
         * Phaser Groups will automatically recycle any inactive members when get() is called...
         * ... but it doesn't automatically reactivate or make them visible so we have to do it
         */
        const carrot = this.carrots.get(sprite.x, y, 'carrot');

        carrot.setActive(true);
        carrot.setVisible(true);

        this.add.existing(carrot);

        carrot.body.setSize(carrot.width, carrot.height);

        this.physics.world.enable(carrot);

        return carrot;
    }

    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} player 
     * @param {Carrot} carrot
     * @description Is called every time player overlaps a carrot, hide the carrot and deactivate its hitbox 
     */
    handleCollectCarrot(player, carrot)
    {
        this.carrots.killAndHide(carrot);
        this.physics.world.disableBody(carrot.body);
        this.carrotsCollected++;
        this.score.text = `Carrots: ${this.carrotsCollected}`;
    }

    /**
     * 
     * @returns {Phaser.Physics.Arcade.Sprite}
     * @description Find and return the current lowest platform of the game
     */
    findBottomMostPlatform()
    {
        const platforms = this.platforms.getChildren();
        let bottomPlatform = platforms[0];

        for (let i = 1; i < platforms.length; i++)
        {
            const platform = platforms[i];

            if (platform.y < bottomPlatform.y)
            {
                continue;
            }

            bottomPlatform = platform;
        }

        return bottomPlatform;
    }
}