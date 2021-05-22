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
connechanAnimSprite.animationSpeed = 0.25;
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
    steps: 14,
    rocksBreakable: [],
    keys: [],
    goals: [],
    stepsText: null,
    player: null
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
blackBoxGraphics.drawRect(0, 0, 100, 100);
blackBoxGraphics.endFill();
const blackBoxTexture = app.renderer.generateTexture(blackBoxGraphics);
const blackBox = new PIXI.Sprite(blackBoxTexture);

for (let i = 0; i < map.height; i ++) {
    for (let t = 0; t < map.width; t ++) { 
        const ground = new PIXI.Sprite(blackBoxTexture);
        ground.x = t * 100;
        ground.y = i * 100;
        ground.anchor.set(0);
        mapContainer.addChild(ground);
        if (map.tile[i][t]) {
            const ground = new PIXI.Sprite(groundTiles[getRandomInt(0, groundTiles.length)]);
            ground.x = t * 100;
            ground.y = i * 100;
            ground.anchor.set(0);
            mapContainer.addChild(ground);
        }

        switch(map.item[i][t]) {
            case ITEM_ROCK_BREAKABLE:
                const rockBreakable = new PIXI.Sprite(PIXI.Texture.from('src/images/partition/tile023.png'))
                rockBreakable.x = t * 100;
                rockBreakable.y = i * 100;
                rockBreakable.anchor.set(0);
                itemContainer.addChild(rockBreakable);
                map.rocksBreakable.push(rockBreakable);
                break;
            case ITEM_ROCK:
                const rock = new PIXI.Sprite(PIXI.Texture.from('src/images/partition/rock.png'))
                rock.x = t * 100;
                rock.y = i * 100;
                rock.anchor.set(0);
                itemContainer.addChild(rock);
                break;
            case ITEM_GOAL:
                const goal = new PIXI.Sprite(PIXI.Texture.from('src/images/partition/goal.png'))
                goal.x = t * 100;
                goal.y = i * 100;
                goal.anchor.set(0);
                itemContainer.addChild(goal);
                map.goals.push(goal);
                break;
            case ITEM_KEY:
                const key = new PIXI.Sprite(PIXI.Texture.from('src/images/partition/tile022.png'))
                key.x = t * 100;
                key.y = i * 100;
                key.anchor.set(0);
                itemContainer.addChild(key);
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

const player = new PIXI.AnimatedSprite(connechanAnimTextures);
player.x = map.startX * 100;
player.y = map.startY * 100;
player.anchor.set(0);
player.animationSpeed = 0.25;
player.play();
map.player = player;
hudContainer.addChild(player);

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;
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