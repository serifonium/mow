class Weapon {
    
}
class Shotgun extends Weapon {
    constructor(customOptions) {
        super()
        let options = {
            speed:2,
            damage:1,
            maxCooldown: 500,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        this.cooldown = 0
    }
    onLeftMouse() {
        if(this.cooldown == 0) {
            let angle = fetchAngle(player.getMiddle(), hoverVector)
            for(let i = 0 ; i < Math.floor(Math.random()*3+3); i++) {
                objects.push(new ShotgunPellet( player.getMiddle(), v(Math.cos(angle + (Math.random() - 0.5)/2 ), Math.sin(angle + (Math.random() - 0.5)/2)) ))
            }
            this.cooldown = this.maxCooldown
        }
    }
    update() {
        if(this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown-getDeltaTime())
        }
    }
}
class ShotgunPellet extends GameObject {
    constructor(pos, vel, customOptions) {
        super(pos, v(8, 8))
        this.pos = v(this.pos.x-this.scale.x/2, this.pos.y-this.scale.y/2)

        let options = {
            speed:9,
            damage:1,
            velocityRandomFactor:2,
            lifespan: 2000,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        
        this.vel = v(vel.x*this.speed + Math.random() * this.velocityRandomFactor, vel.y*this.speed + Math.random() * this.velocityRandomFactor)
    }
    render() {
        ctx.fillStyle = "#ff0"
        rect(this.pos, this.scale)
    }
    update() {
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        this.lifespan = Math.max(0, this.lifespan-getDeltaTime())
        if(this.lifespan === 0) this.remove()
        for(let obj of objects) {
            if(overlap(this, obj)) {
                if(obj instanceof Wall) this.remove()
                if(obj instanceof Enemy) {
                    this.remove()
                    obj.damage(1)
                }
            }
        }
    }
}

class Pistol extends Weapon {
    constructor(customOptions) {
        super()
        this.currentShots = []
        let options = {
            speed:2,
            damage:1,
            maxCooldown: 180,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        this.cooldown = 0
    }
    onLeftMouse() {
        function checkDirection(x) {
            return (player.getMiddle().x > hoverVector.x && player.getMiddle().x > x) || (player.getMiddle().x < hoverVector.x && player.getMiddle().x < x)
        }
        function checkObjType(obj) {
            let accepted = [Wall, Enemy]
            return (obj instanceof Wall || obj instanceof Enemy)
        }
        if(this.cooldown == 0) {
            let angle = fetchAngle(player.getMiddle(), hoverVector)
            let gradient = Math.tan(angle)
            let offset = hoverVector.y - gradient * hoverVector.x 
            let collisions = []
            
            for(let obj of objects) {
                let lines = {
                    "x1":obj.pos.x,
                    "x2":obj.pos.x+obj.scale.x,
                    "y1":obj.pos.y,
                    "y2":obj.pos.y+obj.scale.y,
                }
                for(let key in lines) {
                    let line = lines[key]
                    if(key.charAt(0)==="x") {
                        let pointY = gradient * line + offset
                        if(
                            (obj.pos.y <= pointY && pointY <= obj.pos.y + obj.scale.y) && checkDirection(line) && checkObjType(obj)
                        ) {
                            collisions.push({obj:obj, pos:v(line, pointY)})
                        }
                    } else {
                        let pointX = (line - offset) / gradient
                        if(
                            (obj.pos.x <= pointX && pointX <= obj.pos.x + obj.scale.x) && checkDirection(pointX) && checkObjType(obj)
                        ) {
                            collisions.push({obj:obj, pos:v(pointX, line)})
                        }
                    }
                    
                }
            }
            let closestCollision = undefined
            for(let collision of collisions) {
                if(closestCollision == undefined) {
                    closestCollision = collision
                } else if(getDistance(player.getMiddle(), collision.pos) < getDistance(player.getMiddle(), closestCollision.pos)) {
                    closestCollision = collision
                }
            }

            //objects.push(new DebugCircle(closestCollision.pos))

            if(closestCollision.obj instanceof Enemy) {
                closestCollision.obj.damage(2)
            }

            this.currentShots.push( {start:v(player.getMiddle().x, player.getMiddle().y), end:closestCollision.pos, time: 200} )

            this.cooldown = this.maxCooldown
        }
    }
    update() {
        if(this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown-getDeltaTime())
        }
        for(let shotNum in this.currentShots) {
            let shot = this.currentShots[shotNum]
            if(shot.time > 0) {
                shot.time = Math.max(0, shot.time-getDeltaTime())
            } else {
                this.currentShots.splice(shotNum, 1)
            }
        }
    }
    render() {
        for(let shot of this.currentShots) {
            ctx.globalAlpha = 100/-(shot.time+91.60797831)+1.09160797831

            ctx.beginPath()
            ctx.lineWidth = 8
            ctx.strokeStyle = "#05f"
            ctx.moveTo(shot.start.x, shot.start.y)
            ctx.lineTo(shot.end.x, shot.end.y)
            ctx.stroke()

            ctx.globalAlpha = 1
        }
    }
}