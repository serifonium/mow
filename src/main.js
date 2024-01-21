var objects = [
    new Wall(v(-3, -3), v(50, 2)),
    new Wall(v(-3, -1), v(2, 23)),

    new Wall(v(47, -3), v(2, 25)),

    new Wall(v(-3, 11), v(20, 2)),
    //new Wall(v(-3, -1), v(2, 10)),
    new Wall(v(4, -1), v(2, 7)),
    new Wall(v(6, 4), v(9, 2)),
    new SpawnTrigger(v(1*64, 1*64)),
    new MoveCameraTrigger(v(-1*64, 4*64), v(5, 1), {targetPos:v(5*64, -1*64)}),
    //new TeleportTrigger(v(9*64, 6*64), v(1, 5), {teleportPos:v(9*64, -1*64)}),
    new SpawnEnemyTrigger(v(10*64, 6*64), v(1, 5), {enemies: [
        new Husk(v(3*64, 0*64)),
        new Husk(v(3*64, -1.5*64)),
        new Husk(v(3*64, 1.5*64)),
        new Husk(v(5*64, 0*64)),
        new Husk(v(5*64, -1.5*64)),
        new Husk(v(5*64, 1.5*64)),
    ], spawnOffset: "middle"}),
    new SpawnEnemyTrigger(v(30*64, 6*64), v(1, 5), {enemies: [
        new Virtue(v(3*64, 0*64)),
    ], spawnOffset: "middle"}),
    //new Husk(v(8, 8))
]
var keys = {}
var hover = v(0, 0)
var hoverVector = v(0, 0)
var scaleFactor = 1


document.addEventListener('keydown', (e)=>{
    keys[e.key.toLowerCase()]=true
    lastkey = e.key.toLowerCase()
})
document.addEventListener('keyup', (e)=>{
    keys[e.key.toLowerCase()]=false
})
window.addEventListener('mousemove', (e) => {
    hover.x = e.pageX / scaleFactor;     
    hover.y = e.pageY / scaleFactor;
    hoverVector = v(hover.x+camera.pos.x, hover.y+camera.pos.y)
})
window.addEventListener('mousedown', (e) => {
    if(e.button === 0) {
        //player.weapons.shotgun.onLeftMouse()
        player.weaponSelected.onLeftMouse()
    } else {
        
    }
})



for(let obj of objects) {
    if(obj instanceof SpawnTrigger && obj.active) {
        player.pos = v(obj.pos.x, obj.pos.y)
    }
}