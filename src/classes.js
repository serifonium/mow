class Camera  {
    constructor(pos=v(0, 0), customOptions={}) {
        this.pos = pos
        this.scale = v(window.innerWidth, window.innerHeight)
        this.targetPos = pos
        this.drag = 0.1
        this.vel = v(0, 0)
        this.edges = {
            top:-3*64,
            left:-3*64,
            right:49*64
        }
        let options = {
            mode:"dynamic",
            followDist: 0,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
    }
    getTargetPos() {
        return v(player.pos.x-(window.innerWidth-player.scale.x)/2, player.pos.y-(window.innerHeight-player.scale.y)/2)
    }
    getDist() {
        return getDistance(this.pos, v(player.pos.x-(window.innerWidth-player.scale.x)/2, player.pos.y-(window.innerHeight-player.scale.y)/2))
    }
    updateVel() {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y

        this.pos.x = Math.min(Math.max(this.edges.left, this.pos.x), this.edges.right - this.scale.x)
        this.pos.y = Math.max(this.edges.top, this.pos.y)

        
    }
    update() {
        if(this.mode === "dynamic") {
            if(this.getDist()>this.followDist) {
                this.targetPos.x = this.getTargetPos().x
                this.targetPos.y = this.getTargetPos().y
            }

            this.vel.x = -(this.pos.x-this.targetPos.x)*this.drag
            this.vel.y = -(this.pos.y-this.targetPos.y)*this.drag

            this.updateVel()
        } 
        if(this.mode === "static") {
            this.vel.x = -(this.pos.x-this.targetPos.x)*this.drag
            this.vel.y = -(this.pos.y-this.targetPos.y)*this.drag

            this.updateVel()
        } 
        

        hoverVector = v(hover.x+camera.pos.x, hover.y+camera.pos.y)
    }
    changeMiddle(pos) {
        this.targetPos = v(pos.x-window.innerWidth/2, pos.y-window.innerHeight/2)
    }
}



var camera = new Camera()

//camera.changeMiddle(v(12*64, 5*64))
camera.targetPos = v(-2.6*64, -2.2*64)

class DebugPoint {
    constructor(pos=v(0), radius=8) {
        this.pos = pos
        this.scale = v(1, 1)
        this.vel = v(0)
        this.radius = radius
    }
    render() {
        ctx.beginPath()
        ctx.fillStyle = "#f30"
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2)
        ctx.fill()
    }
} class DebugObject {
    constructor(pos=v(0), scale=v(64)) {
        this.pos = pos
        this.scale = scale
        this.vel = v(0)

        
    }
    render() {
        ctx.fillStyle = "#f30"
        rect(this.pos, this.scale)
    }
}


class GameObject {
    constructor(pos=v(0), scale=v(64)) {
        this.pos = pos
        this.scale = scale
        this.vel = v(0, 0)
    }
    getMiddle() {
        return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
    }
    setMiddle(pos) {
        return v(pos.x-this.scale.x/2, pos.y-this.scale.y/2)
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
                return 0
            }
        }
    }
}

class ParryWindow extends GameObject{
    constructor(pos=v(0), force, customOptions) {
        super(pos, v(1, 1))
        this.force = force
        let options = {
            time:400,
            timeMultiplier:1,
            ...difficultySettings[difficulty].parryWindow,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        this.time = this.time * this.timeMultiplier
    }
    render() {
        ctx.beginPath()
        ctx.fillStyle = "#f90"
        ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI*2)
        ctx.fill()
    }
    update() {
        if(this.time>0) {
            this.time = Math.max(this.time-getDeltaTime(), 0)
        } else {
            this.remove()
        }
    }
}


class Wall extends GameObject {
    constructor(pos=v(0), scale=v(1)) {
        super(v(pos.x*64, pos.y*64), v(scale.x*64, scale.y*64))
    }
    render() {
        ctx.fillStyle = "#ccc"
        ctx.fillRect(this.pos.x-1, this.pos.y-1, this.scale.x+2, this.scale.y+2)
    }
}
class Trigger extends GameObject {
    constructor(pos=v(0), scale=v(64), textureCode=undefined) {
        super(pos, scale)
        this.textureCode = textureCode
        this.active = true
    }
    render() {
        if(this.active) ctx.strokeStyle = "#3fa"
        else ctx.strokeStyle = "#f23"
        ctx.beginPath()
        ctx.lineWidth=1
        ctx.rect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
        ctx.stroke()
        ctx.closePath()
        if(this.textureCode) {
            functionIcons.renderFromKeycodes(v(this.getMiddle().x-32, this.getMiddle().y-32), this.textureCode)
        }
    }
}
class SpawnTrigger extends Trigger {
    constructor(pos=v(0), scale=v(1)) {
        super(v(pos.x, pos.y), v(scale.x*64, scale.y*64), "spawn")
    }
}
class MoveCameraTrigger extends Trigger {
    constructor(pos=v(0), scale=v(1), options={}) {
        super(v(pos.x, pos.y), v(scale.x*64, scale.y*64), "moveCam")
        this.options = {
            targetPos:v(0, 0),
            ...options
        }
        
    }
    onCollision() {
        if(this.active) {
            if(camera.mode == "static") {
                camera.targetPos = v(this.targetPos.x, this.targetPos.y)
                this.active = false
            } else if(camera.mode == "stationary") {

            }
        }
    }
}
class SpawnEnemyTrigger extends Trigger {
    constructor(pos=v(0), scale=v(1), options={}) {
        super(v(pos.x, pos.y), v(scale.x*64, scale.y*64), "spawnEnemy")
        this.options = {
            enemies: [new Husk(v(8, 8))],
            spawnOffset: false,
            ...options
        }
        
    }
    onCollision() {
        if(this.active) {
            for(let enemy of this.options.enemies) {
                if(this.options.spawnOffset == "regular") {
                    enemy.pos.x += this.pos.x
                    enemy.pos.y += this.pos.y
                } else if(this.options.spawnOffset == "middle") {
                    enemy.pos.x += this.getMiddle().x - enemy.scale.x/2
                    enemy.pos.y += this.getMiddle().y - enemy.scale.y/2
                } 
                objects.push(enemy)
            }
            this.active = false
        }
    }
}
class TeleportTrigger extends Trigger {
    constructor(pos=v(0), scale=v(1), customOptions={}) {
        super(v(pos.x, pos.y), v(scale.x*64, scale.y*64), "teleport")
        let options = {
            teleportPos: v(0, 0),
            preserveOffset: true,
            teleportCamera: true,
            preserveState: false,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        
        
    }
    renderSecondary() {
        ctx.strokeStyle = "#f0f"
        ctx.beginPath()
        ctx.lineWidth=1
        ctx.rect(this.teleportPos.x, this.teleportPos.y, this.scale.x, this.scale.y)
        ctx.stroke()
        ctx.closePath()
    }
    onCollision() {
        if(this.active) {
            if(this.preserveOffset) {
                let offset = v(this.pos.x-this.teleportPos.x, this.pos.y-this.teleportPos.y)
                let playerOffset = v(this.pos.x-player.pos.x, this.pos.y-player.pos.y)
                player.pos = v(this.teleportPos.x-playerOffset.x, this.teleportPos.y-playerOffset.y)
            } else {
                player.pos = v(this.teleportPos.x, this.teleportPos.y)
            }
            if(this.teleportCamera) {
                camera.pos = camera.getTargetPos()
                camera.update()
            }
            if(!this.preserveState) {
                this.active = false
            }
        }
    }
}