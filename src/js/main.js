const ITEM_ROCK_BREAKABLE = 2;
const ITEM_ROCK = 3;
const ITEM_GOAL = 4;
const ITEM_KEY = 5;

const app = new PIXI.Application({
    width: window.innerWidth, height: window.innerHeight, resizeTo: window, transparent: true, resolution: window.devicePixelRatio || 1,
});
console.log('window.devicePixelRatio', window.devicePixelRatio);
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
// const texture = PIXI.Texture.from('src/images/sprite.png');
//
// // Create a 5x5 grid of bunnies
// for (let i = 0; i < 25; i++) {
//     const bunny = new PIXI.Sprite(texture);
//     bunny.anchor.set(0.5);
//     bunny.x = (i % 5) * 40;
//     bunny.y = Math.floor(i / 5) * 40;
//     container.addChild(bunny);
// }
const connechan_1_sprite = PIXI.Texture.from('src/images/partition/connechan_1.png');
for (let i = -50; i < app.screen.width + 50; i += 50) {
    for (let t = -50; t < app.screen.height + 50; t += 50) {
        const conneChan = new PIXI.Sprite(connechan_1_sprite);
        conneChan.x = i;
        conneChan.y = t;
        container.addChild(conneChan);
    }
}


console.log('w x h', app.screen.width, app.screen.height)
// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

const connechanAnimTextures = [];

for (let i = 1; i <= 12; i ++) {
    connechanAnimTextures.push(PIXI.Texture.from(`src/images/partition/connechan_${i}.png`));
}

const connechanAnimSprite = new PIXI.AnimatedSprite(connechanAnimTextures);
connechanAnimSprite.x = 100;
connechanAnimSprite.y = 100;
connechanAnimSprite.anchor.set(0);
connechanAnimSprite.animationSpeed = 2565 / 10000;
connechanAnimSprite.play();
app.stage.addChild(connechanAnimSprite);


const map = {
    tile:   [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
            ],
    item:   [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 5, 3, 0, 4, 0, 0],
        [0, 0, 2, 3, 2, 3, 0],
        [0, 0, 2, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
    ],
    startX: 1,
    startY: 4,
    width: 7,
    height: 7,
    steps: 13,
    rocksBreakable: [],
    keys: [],
    goals: [],
    stepsText: null,
    player: null,
    shakeX: 0,
    blockSize: 100,
}

const groundTiles = [
    PIXI.Texture.from('src/images/partition/ground_1.png'),
    PIXI.Texture.from('src/images/partition/ground_2.png'),
    PIXI.Texture.from('src/images/partition/ground_3.png'),
]

const mapContainer = new PIXI.Container();
const itemContainer = new PIXI.Container();
const hudContainer = new PIXI.Container();

app.stage.addChild(mapContainer);
app.stage.addChild(itemContainer);
app.stage.addChild(hudContainer);

const blackBoxGraphics = new PIXI.Graphics();
blackBoxGraphics.beginFill(0x000000);
blackBoxGraphics.drawRect(0, 0, map.blockSize, map.blockSize);
blackBoxGraphics.endFill();
const blackBoxTexture = app.renderer.generateTexture(blackBoxGraphics);

class GameObject {
    constructor(x, y, texture, blockSize) {
        this.sprite = new PIXI.Sprite(texture)
        this.sprite.x = x * blockSize;
        this.sprite.y = y * blockSize;
        this.sprite.anchor.set(0);
        
        this.blockSize = blockSize;
        this.x = x;
        this.y = y;
    }

    capture() {
        let [x, y] = [this.x, this.y];
        if (this.x - 1 === map.player.x && this.y === map.player.y) { // current player is located leftside
            [x, y] = map.player.playerMove(map.player.x, map.player.y, 'ArrowRight');
        } else if (this.x === map.player.x && this.y - 1 === map.player.y) { // current player is located topside
            [x, y] = map.player.playerMove(map.player.x, map.player.y, 'ArrowDown');
        } else if (this.x + 1 === map.player.x && this.y === map.player.y) { // current player is located rightside
            [x, y] = map.player.playerMove(map.player.x, map.player.y, 'ArrowLeft');
        } else if (this.x === map.player.x && this.y + 1 === map.player.y) { // current player is located bottomside
            [x, y] = map.player.playerMove(map.player.x, map.player.y, 'ArrowUp');
        }
        if(x !== this.x || y !== this.y) {
            return false;
        }
        return true;
    }
}

class BlackTile extends GameObject{
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
    }
}

class GroundTile extends GameObject {
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;

        this.sprite.on('pointerdown', this.onClick.bind(this));
    }

    onClick(e) {
        console.log('asdf');
        if (map.player && Math.abs(map.player.x - this.x) + Math.abs(map.player.y - this.y) === 1 && map.item[this.y][this.x] == 0) {
            if (this.x - 1 === map.player.x && this.y === map.player.y) { // current player is located leftside
                map.player.playerMove(map.player.x, map.player.y, 'ArrowRight');
            } else if (this.x === map.player.x && this.y - 1 === map.player.y) { // current player is located topside
                map.player.playerMove(map.player.x, map.player.y, 'ArrowDown');
            } else if (this.x + 1 === map.player.x && this.y === map.player.y) { // current player is located rightside
                map.player.playerMove(map.player.x, map.player.y, 'ArrowLeft');
            } else if (this.x === map.player.x && this.y + 1 === map.player.y) { // current player is located bottomside
                map.player.playerMove(map.player.x, map.player.y, 'ArrowUp');
            }
        }
    }
}

class Rock extends GameObject{
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
    }
}

class RockBreakable extends Rock {
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
        this.health = 1;
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('pointerdown', this.onClick.bind(this));
    }

    onClick(e) {
        console.log('[RockBreakable] [onClick]', e)
        if (map.player && Math.abs(map.player.x - this.x) + Math.abs(map.player.y - this.y) === 1 && map.item[this.y][this.x] === ITEM_ROCK_BREAKABLE) {
            this.break();
        }
    }

    break() {
        if(decreaseStepCounter()) {
            map.shakeX = 8;
            this.health --;
            if (this.health <= 0) {
                map.item[this.y][this.x] = 0;
                this.sprite.destroy();
            }
        }
    }
}

class ItemKey extends GameObject {
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;

        this.sprite.on('pointerdown', this.onClick.bind(this));
    }

    onClick(e) {
        console.log('[ItemKey] [onClick]', e)
        if (map.player && Math.abs(map.player.x - this.x) + Math.abs(map.player.y - this.y) === 1 && map.item[this.y][this.x] === ITEM_KEY) {
            if (this.capture()) {
                this.takeIt();
            }
        }
    }

    takeIt() {
        map.item[this.y][this.x] = 0;
        map.player.key ++;
        this.sprite.destroy();
    }
}

class ItemGoal extends GameObject {
    constructor(x, y, texture, blockSize) {
        super(x, y, texture, blockSize);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;

        this.sprite.on('pointerdown', this.onClick.bind(this));
    }

    onClick(e) {
        console.log('[ItemGoal] [onClick]', e)
        if (map.player && Math.abs(map.player.x - this.x) + Math.abs(map.player.y - this.y) === 1 && map.item[this.y][this.x] === ITEM_GOAL) {
            if (map.player.key > 0 && this.capture()) {
                this.takeIt();
            }
        }
    }

    takeIt() {
        map.item[this.y][this.x] = 0;
        map.player.key --;
        this.sprite.destroy();
    }
}

for (let i = 0; i < map.height; i ++) {
    for (let t = 0; t < map.width; t ++) { 
        const ground = new BlackTile(t, i, blackBoxTexture, map.blockSize);
        mapContainer.addChild(ground.sprite);
        if (map.tile[i][t]) {
            const ground = new GroundTile(t, i, groundTiles[getRandomInt(0, groundTiles.length)], map.blockSize);
            mapContainer.addChild(ground.sprite);
        }

        switch(map.item[i][t]) {
            case ITEM_ROCK_BREAKABLE:
                const rockBreakable = new RockBreakable(t, i, PIXI.Texture.from('src/images/partition/tile023.png'), map.blockSize);
                itemContainer.addChild(rockBreakable.sprite);
                map.rocksBreakable.push(rockBreakable);
                break;
            case ITEM_ROCK:
                const rock = new Rock(t, i, PIXI.Texture.from('src/images/partition/rock.png'), map.blockSize);
                itemContainer.addChild(rock.sprite);
                break;
            case ITEM_GOAL:
                const goal = new ItemGoal(t, i, PIXI.Texture.from('src/images/partition/goal.png'), map.blockSize);
                itemContainer.addChild(goal.sprite);
                map.goals.push(goal);
                break;
            case ITEM_KEY:
                const key = new ItemKey(t, i, PIXI.Texture.from('src/images/partition/tile022.png'), map.blockSize);
                itemContainer.addChild(key.sprite);
                map.keys.push(key);
                break;
        }
    }
}
mapContainer.x = app.screen.width / 2;
mapContainer.y = app.screen.height / 2;
mapContainer.pivot.x = mapContainer.width / 2;
mapContainer.pivot.y = mapContainer.height / 2;

itemContainer.x = app.screen.width / 2;
itemContainer.y = app.screen.height / 2;
itemContainer.pivot.x = mapContainer.width / 2;
itemContainer.pivot.y = mapContainer.height / 2;

hudContainer.x = app.screen.width / 2;
hudContainer.y = app.screen.height / 2;
hudContainer.pivot.x = mapContainer.width / 2;
hudContainer.pivot.y = mapContainer.height / 2;

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontWeight: 'bold',
    stroke: '#ffffff',
    strokeThickness: 5,
});
const stepsText = new PIXI.Text(`STEPS: ${map.steps}`, style);
stepsText.x = 0;
stepsText.y = 0;
map.stepsText = stepsText;
hudContainer.addChild(stepsText);

function move(x, y, dir) {
    console.log('move', x, y, dir)
    switch(dir) {
        case 'ArrowLeft':
            if (x > 0 && map.tile[y][x - 1] && decreaseStepCounter()) {
                x -= 1;
            }
            break;
        case 'ArrowUp':
            if (y > 0 && map.tile[y - 1][x] && decreaseStepCounter()) {
                y -= 1;
            }
            break;
        case 'ArrowRight':
            if (x < map.width - 1 && map.tile[y][x + 1] && decreaseStepCounter()) {
                x += 1;
            }
            break;
        case 'ArrowDown':
            if (y < map.height - 1 && map.tile[y + 1][x] && decreaseStepCounter()) {
                y += 1;
            }
            break;
    }
    return [x, y];
}

function decreaseStepCounter() {
    console.log('map.steps', map.steps)
    if (map.steps > 0) {
        map.steps --;
        map.stepsText.text = `STEPS: ${map.steps}`
        return true;
    }
    return false;
}

class Player{
    constructor(x, y, textures, blockSize) {
        this.sprite = new PIXI.AnimatedSprite(textures);
        this.sprite.x = x * blockSize;
        this.sprite.y = y * blockSize;
        this.sprite.anchor.set(0);
        this.sprite.animationSpeed = 2565 / 10000;
        this.sprite.play();

        this.x = x;
        this.y = y;
        this.blockSize = blockSize;
        this.key = 0;

        window.addEventListener('keydown', this.onKeyDown.bind(this))
    }

    playerMove(x, y, dirKey) {
        [this.x, this.y] = move(x, y, dirKey);
        this.sprite.x = this.x * this.blockSize;
        this.sprite.y = this.y * this.blockSize;
        return [this.x, this.y];
    }

    onKeyDown(e) {
        // this.playerMove(this.x, this.y, e.key);
    }
}

const player = new Player(map.startX, map.startY, connechanAnimTextures, map.blockSize)
map.player = player;
hudContainer.addChild(player.sprite);


// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;

    mapContainer.x = Math.sin(map.shakeX) * 8 + app.screen.width / 2;
    itemContainer.x = Math.sin(map.shakeX) * 8 + app.screen.width / 2;
    hudContainer.x = Math.sin(map.shakeX) * 8 + app.screen.width / 2;

    if (map.shakeX > 0) {
        map.shakeX += (0 - delta);
    }
});

// window.addEventListener('resize', () => {
//     app.view.style.width = window.innerHeight + 'px';
//     app.view.style.height = window.innerHeight + 'px';
// })
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }