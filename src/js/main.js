const app = new PIXI.Application({
    width: window.innerWidth, height: window.innerHeight, transparent: true, resolution: window.devicePixelRatio || 1,
});
console.log('window.devicePixelRatio', window.devicePixelRatio);
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from('src/images/sprite.png');

// Create a 5x5 grid of bunnies
for (let i = 0; i < 25; i++) {
    const bunny = new PIXI.Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
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
connechanAnimSprite.anchor.set(0.5);
connechanAnimSprite.animationSpeed = 0.25;
connechanAnimSprite.play();
app.stage.addChild(connechanAnimSprite);

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});
