var tick = Date.now()
var lastTick = Date.now()
function update() {
    tick = Date.now()
    camera.update()
    player.update()
    for(let obj of objects) {
        if(obj.update)obj.update()
    }
    lastTick = Date.now()
}
setInterval(() => {
    update()
}, 1000/60);

function getDeltaTime() {
    return (tick - lastTick)
}