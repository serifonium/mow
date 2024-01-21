var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.textAlign = "center";
var camera = {
    pos:v(0, 0),
    vel:v(0, 0),
    speed:4,
    update:()=>{
        if(keys[keybinds["up"]]&&!keys[keybinds["down"]]) camera.vel.y = -camera.speed
        else if(keys[keybinds["down"]]&&!keys[keybinds["up"]]) camera.vel.y = camera.speed
        else camera.vel.y = 0
        if(keys[keybinds["left"]]&&!keys[keybinds["right"]]) camera.vel.x = -camera.speed
        else if(keys[keybinds["right"]]&&!keys[keybinds["left"]]) camera.vel.x = camera.speed
        else camera.vel.x = 0
        camera.pos.x += camera.vel.x
        camera.pos.y += camera.vel.y
    }
}
var keys = {}
var hover = v(0, 0)
var hoverVector = v(0, 0)
var scaleFactor = 1
var keybinds = {
    "up":"w",
    "down":"s",
    "left":"a",
    "right":"d",
}
var objects = [

]

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
        for(let element of UI) {
            if(overlap({pos:hover, scale:v(1)}, element)) {
                console.log("e")
            }
        }
    } else {
        
    }
})
class UiElement {
    constructor(pos, scale, customOptions={}) {
        this.pos = pos
        this.scale = scale
        this.vel = v(0, 0)
        let options = {
            speed:2,
            health:3,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
    }
}
var UI = [
    new UiElement(v(100, window.innerHeight-128-64), v(window.innerWidth-100*2, 128), {
        render:(t)=>{
            ctx.fillStyle = "#aaa"
            rect(v(t.pos.x-4,t.pos.y-4), v(t.scale.x+8, t.scale.y+8))
            ctx.fillStyle = "#555"
            rect(t.pos, t.scale)
        },
        placeables: [
            "Wall"
        ]
    })
]

function render() {
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    


    
    ctx.fillStyle="#000"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    

    ctx.translate(-camera.pos.x, -camera.pos.y);

    ctx.fillStyle="#f50"
    ctx.fillRect(0, 0, 64, 64)

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    for(let element of UI) {
        if(element.render)element.render(element)
    }
}

setInterval(() => {
    render()
}, 1000/60);


function update() {
    tick = Date.now()
    camera.update()
    lastTick = Date.now()
}
setInterval(() => {
    update()
}, 1000/60);

function getDeltaTime() {
    return (tick - lastTick)
}



