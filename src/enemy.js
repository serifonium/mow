class Enemy extends GameObject {
    constructor(pos=v(0), scale=v(64)) {
        super(pos, scale)
    }
    damage(h=1) {
        this.health += -h
        
    }
    kill() {
        this.remove()
        if(this.stamGain) player.stamina = Math.min(1, player.stamina + this.stamGain)
    }
}
class Husk extends Enemy {
    constructor(pos=v(0), customOptions={}) {
        super(v(pos.x, pos.y), v(1*64, 1*64))
        this.animFrame = v(0, 0)
        this.animTimer = 0
        this.animFactor = 0
        this.attackTime = 0
        this.attackTimeMax = 600
        this.attackDist = 96
        this.stun = 0
        this.stunMax = 1000
        let options = {
            ...difficultySettings[difficulty].husk,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
        
        this.target = v(player.pos.x, player.pos.y)
    }
    update() {
        let STUNNED = this.stun>0
        let ATTACKING = this.attackTime>0





        if(STUNNED) {

        } else if (ATTACKING) {
            if(this.pos.x>this.target.x) {
                this.animFactor==0?this.animFrame=v(0, 1):this.animFrame=v(1, 1)
            } else {
                this.animFactor==0?this.animFrame=v(2, 1):this.animFrame=v(3, 1)
            }
        } else {
            if(this.pos.x>this.target.x) {
                this.animFactor==0?this.animFrame=v(0, 0):this.animFrame=v(1, 0)
            } else {
                this.animFactor==0?this.animFrame=v(2, 0):this.animFrame=v(3, 0)
            }
        }

        this.animTimer += getDeltaTime()
        if(this.animTimer > 600) {
            this.animTimer = 0
            this.animFactor++
            if(this.animFactor > 1) {
                this.animFactor = 0
            }
        }

        this.target = v(player.pos.x, player.pos.y)
        let angle = fetchAngle(this.pos, this.target)
        this.vel = v(Math.cos(angle)*this.speed, Math.sin(angle)*this.speed)

        

        if(STUNNED) {

        } else {
            if(ATTACKING) {
                this.attackTime = Math.max(0, this.attackTime-getDeltaTime())
                if(this.attackTime==0)this.attack()
            } else {
                let PLAYER_WITHIN_DISTANCE = getDistance(this.getMiddle(), player.getMiddle())<=128

                this.updateVelocity()
                if(PLAYER_WITHIN_DISTANCE) {
                    this.attackTime = this.attackTimeMax
                    objects.push(new ParryWindow(
                        v(this.getMiddle().x + Math.cos(angle)*this.attackDist, this.getMiddle().y + Math.sin(angle)*this.attackDist), 
                        this,
                    ))
                }
            }
        }
        

        if(overlap(this, player))player.damage(1)
        if(this.health <= 0) this.kill()
    }
    attack() {
        let angle = fetchAngle(this.pos, this.target)

        let middle = v(this.getMiddle().x + Math.cos(angle)*this.attackDist, this.getMiddle().y + Math.sin(angle)*this.attackDist)
        //objects.push(new DebugPoint(middle, 32))
        if(getDistance(player.getMiddle(), middle)<32) {
            player.damage(1)
        }

    }
    parry() {
        console.log("sugarcoated")
        this.damage(3)
    }
    updateVelocity(options={}) {
        let xOverlap = checkObjsOverlap({pos:v(this.pos.x+this.vel.x, this.pos.y), scale:this.scale})
        let yOverlap = checkObjsOverlap({pos:v(this.pos.x, this.pos.y+this.vel.y), scale:this.scale})
        let xMove = true
        let yMove = true
        for(let obj of xOverlap) {
            if(obj instanceof Wall) {
                if(this.vel.x > 0) this.pos.x = obj.pos.x-this.scale.x-this.vel.x-1
                else this.pos.x = obj.pos.x+obj.scale.x-this.vel.x+1
            }
        }
        if(xMove) {
            this.pos.x += this.vel.x
        }
        for(let obj of yOverlap) {
            if(obj instanceof Wall) {
                if(this.vel.y > 0) this.pos.y = obj.pos.y-this.scale.y-this.vel.y-1
                else this.pos.y = obj.pos.y+obj.scale.y-this.vel.y+1
            }
        }
        if(yMove) {
            this.pos.y += this.vel.y
        }
    }
    render() {
        ctx.fillStyle = "#f30"
        //rect(this.pos, this.scale)

        huskSprites.render(v(this.pos.x, this.pos.y-64), this.animFrame)
    }
}

class Virtue extends Enemy {
    constructor(pos=v(0), customOptions={}) {
        super(v(pos.x, pos.y), v(1*64, 1*64))

        this.timer = 0
        this.animFrame = 0
        this.animTimer = 0

        this.beampos = v(player.pos.x, player.pos.y)
        this.beamvel = v(0, 0)
        this.beamspeed = 2
        this.target = v(player.pos.x, player.pos.y)


        this.animCodes = {
            "0": v(0, 0),
            "1": v(1, 0),
            "2": v(2, 0),
            "3": v(1, 0),
            "4": v(0, 0),
        }
        this.strikeTimes = {
            "start":0,
            "charge":500,
            "lock":2500,
            "fire":4000,
            "end":6000,
        }
        let options = {
            ...difficultySettings[difficulty].virtue,
            ...customOptions
        }
        for(let key in options) {
            this[key] = options[key]
        }
    
        
    
    }
    update() {
        let angle = fetchAngle(this.pos, player.pos)
        this.vel = v(Math.cos(angle)*-this.speed, Math.sin(angle)*-this.speed)
        this.updateVelocity()
        if(overlap(this, player))player.damage(1)
        if(this.health <= 0) this.kill()

        this.animTimer += getDeltaTime()
        if(this.animTimer > 250) {
            this.animTimer = 0
            this.animFrame++
            if(this.animFrame > 3) {
                this.animFrame = 0
            }
        }
        this.timer += getDeltaTime()
        if(this.timer > this.strikeTimes.end) {
            this.timer = 0
        } else if(this.timer > this.strikeTimes.fire) {
            
            if(overlap(player, {pos:v(this.beampos.x-64, -10000), scale:v(128, 20000)})) {
                player.damage(1)
            }
        } else if(this.timer > this.strikeTimes.lock) {

        } else if(this.timer > this.strikeTimes.charge) {
            this.target = v(player.getMiddle().x, player.getMiddle().y)
            let angle = fetchAngle(this.beampos, this.target)
            this.beamvel = v(Math.cos(angle)*this.beamspeed, Math.sin(angle)*this.beamspeed)
            if(this.beamvel.x)this.beampos.x += this.beamvel.x
            if(this.beamvel.y)this.beampos.y += this.beamvel.y
        } else if(this.timer > this.strikeTimes.start) {
            this.beampos = v(player.getMiddle().x, player.getMiddle().y)
        } 

    }
    updateVelocity(options={}) {
        let xOverlap = checkObjsOverlap({pos:v(this.pos.x+this.vel.x, this.pos.y), scale:this.scale})
        let yOverlap = checkObjsOverlap({pos:v(this.pos.x, this.pos.y+this.vel.y), scale:this.scale})
        let xMove = true
        let yMove = true
        for(let obj of xOverlap) {
            if(obj instanceof Wall) {
                if(this.vel.x > 0) this.pos.x = obj.pos.x-this.scale.x-this.vel.x-1
                else this.pos.x = obj.pos.x+obj.scale.x-this.vel.x+1
            }
        }
        if(xMove) {
            this.pos.x += this.vel.x
        }
        for(let obj of yOverlap) {
            if(obj instanceof Wall) {
                if(this.vel.y > 0) this.pos.y = obj.pos.y-this.scale.y-this.vel.y-1
                else this.pos.y = obj.pos.y+obj.scale.y-this.vel.y+1
            }
        }
        if(yMove) {
            this.pos.y += this.vel.y
        }
    }
    render() {
        ctx.fillStyle = "#f30"
        ctx.beginPath()
        ctx.arc(this.getMiddle().x, this.getMiddle().y, this.scale.x/2, 0, Math.PI*2)
        ctx.fill()


        if(this.timer > this.strikeTimes.fire && this.timer < this.strikeTimes.end) {
            ctx.fillRect(this.beampos.x-64, -10000, 128, 20000)
        } else if(this.timer > this.strikeTimes.charge) {
            virtueSignals.render(v(this.beampos.x-64, this.beampos.y-64), this.animCodes[this.animFrame])
        }
    }
}