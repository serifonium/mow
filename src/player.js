class Player {
    constructor() {
        this.pos = v(0, 0)
        this.scale = v(64)
        this.vel = v(0, 0)
        this.baseSpeed = 4
        this.speed = this.baseSpeed
        this.health = 5
        this.maxHealth = 5
        this.iTime = 0
        this.dashTimeActive = 0
        this.dashTime = 0
        this.dashCost = 0.125
        this.stamina = 1
        this.healTime = 0
        this.healTimeReqirement = 1000
        this.healCost = 0.5
        this.punchCooldown = 0
        this.punchCooldownMax = 500
        this.recentPunch = {
            pos: undefined,
            side: "left",
            time: 0,
            timeMax: 200,
            radius: 64,
            dist: 32,
            update: ()=>{
                if(this.recentPunch.time>0) {
                    this.recentPunch.time = Math.max(0, this.recentPunch.time-getDeltaTime())
                } else {
                    this.recentPunch.pos = undefined
                }
            }, render: () => {
                if(this.recentPunch.pos) {
                    /*
                    ctx.globalAlpha = 1
                    ctx.beginPath()
                    ctx.fillStyle = "#f6a"
                    ctx.arc(this.recentPunch.pos.x, this.recentPunch.pos.y, this.recentPunch.radius, 0, Math.PI*2)
                    ctx.fill()
                    ctx.globalAlpha = 1
                    */
                    let frame = Math.floor((1-(this.recentPunch.time/this.recentPunch.timeMax))*7)
                    if(this.recentPunch.side == "right") {
                        punchFrames.render(v(this.pos.x+64, this.pos.y), v(frame, 0))
                    } else {
                        punchFrames.render(v(this.pos.x-64, this.pos.y), v(7-frame, 1))
                    }
                    
                }
            }
        }
        this.keybinds = {
            "up":"w",
            "down":"s",
            "left":"a",
            "right":"d",
            "dash":"shift",
            "heal":"q",
            "punch": "f",
            "swapWeapon": "e",
            "selectShotgun": "2",
            "selectPistol": "1",

        }
        this.customColour = {
            "health": "#f4a",
            "healingHealth": "#f7d",
            "emptyHealth": "#200",
            "stamina": "#24f",
            "emptyStamina": "#124"
        }
        this.weapons = {
            shotgun: new Shotgun(),
            pistol: new Pistol()
        }
        this.weaponSelected = this.weapons.pistol
    } 
    getMiddle() {
        return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
    }
    render() {
        ctx.fillStyle = "#09f"
        rect(this.pos, this.scale)
        this.weapons.pistol.render()
        this.recentPunch.render()
    }
    damage(h=1) {
        if(!this.iTime>0) {
            this.health += -h
            this.iTime = 800
        }
    }
    respawn() {
        this.health = this.maxHealth
        for(let obj of objects) {
            if(obj instanceof SpawnTrigger) {
                player.pos = v(obj.pos.x, obj.pos.y)
            }
        }
    }
    update() {
        this.updateVelocity()
        this.updateTriggers()
        if(keys[this.keybinds["up"]]&&!keys[this.keybinds["down"]]) this.vel.y = -this.speed
        else if(keys[this.keybinds["down"]]&&!keys[this.keybinds["up"]]) this.vel.y = this.speed
        else this.vel.y = 0
        if(keys[this.keybinds["left"]]&&!keys[this.keybinds["right"]]) this.vel.x = -this.speed
        else if(keys[this.keybinds["right"]]&&!keys[this.keybinds["left"]]) this.vel.x = this.speed
        else this.vel.x = 0
        if(keys[this.keybinds["dash"]]&&
        this.dashTime==0&&
        this.stamina>=this.dashCost&&(
            this.vel.x != 0 ||
            this.vel.y != 0
        )) {
            this.dashTimeActive = 250
            this.iTime = 250
            this.dashTime = 450
            this.stamina += -this.dashCost
        }
        if(
            keys[this.keybinds["heal"]]&&
            this.health != this.maxHealth &&
            this.stamina >= this.healCost
        ) {
            this.healTime = Math.min(this.healTimeReqirement, this.healTime+getDeltaTime())
            if (this.healTime == this.healTimeReqirement) {
                this.healTime = 0
                this.health += 1
                this.stamina += -this.healCost
            }
        } else {
            this.healTime = Math.max(0, this.healTime-getDeltaTime()*2)
        }

        this.recentPunch.update()
        if(this.punchCooldown>0) {
            this.punchCooldown = Math.max(0, this.punchCooldown-getDeltaTime())
        } else if(keys[this.keybinds["punch"]]) {
            this.punch()
        }

        if(this.dashTimeActive>0) {
            this.vel.x *= 3
            this.vel.y *= 3

            this.dashTimeActive = Math.max(0, this.dashTimeActive-getDeltaTime())
        } if(this.dashTime>0) {
            this.dashTime = Math.max(0, this.dashTime-getDeltaTime())
        }

        if(this.iTime>0) {
            this.iTime = Math.max(0, this.iTime-getDeltaTime())
        }
        if(this.health <= 0) {
            this.respawn()
        }
        this.weapons.shotgun.update()
        this.weapons.pistol.update()
        if(keys[this.keybinds["selectPistol"]]) this.weaponSelected = this.weapons.pistol
        if(keys[this.keybinds["selectShotgun"]]) this.weaponSelected = this.weapons.shotgun

        if(keys[this.keybinds["swapWeapon"]]) {
            keys[this.keybinds["swapWeapon"]] = false
            if(this.weaponSelected instanceof Shotgun) {
                this.weaponSelected = this.weapons.pistol
            }
            else if(this.weaponSelected instanceof Pistol) {
                this.weaponSelected = this.weapons.shotgun
            }  
        }


    }
    punch() {
        this.punchCooldown = this.punchCooldownMax
        let angle = fetchAngle(player.getMiddle(), hoverVector)
        let middle = v(this.getMiddle().x+Math.cos(angle)*this.recentPunch.dist, this.getMiddle().y+Math.sin(angle)*this.recentPunch.dist)
        this.recentPunch.pos = middle
        this.recentPunch.time = this.recentPunch.timeMax
        if(this.getMiddle().x<this.recentPunch.pos.x) {
            this.recentPunch.side = "right"
        } else {
            this.recentPunch.side = "left"
        }
        
        for(let obj of objects) {

            if(obj.getMiddle) {
                if(getDistance(this.recentPunch.pos, obj.getMiddle())<128) {
                    if(obj instanceof ParryWindow) {
                        obj.remove()
                        obj.force.parry()
                    }
                    if(obj instanceof Enemy) {
                        obj.damage(1)
                    }
                }
            }
        }

    }
    updateTriggers() {
        let objs = checkObjsOverlap(this)
        for(let obj of objs) {
            if(obj.onCollision) {
                obj.onCollision()
            }
        }
    }
    updateVelocity(options={}) {
        this.vel.x = this.vel.x*60*getDeltaTime()/1000
        this.vel.y = this.vel.y*60*getDeltaTime()/1000
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
        if(xMove) {
            this.pos.y += this.vel.y
        }
    }
}

var player = new Player()




var difficulty = "easy"

var difficultySettings = {
    "easy": {
        "husk": {
            health: 3,
            speed: 2,
            stamGain: 0.3,
        },
        "virtue": {
            health: 8,
            speed: 1,
            stamGain: 0.6,
            strikeTimes: {
                "start":0,
                "charge":3500,
                "lock":5000,
                "fire":6000,
                "end":7000,
            },
            beamspeed: 1
        },
        "parryWindow": {
            timeMultiplier: 1
        },
        "player": {
            dashCost: 0.1,
            health: 5,
            maxHealth: 5,
            healCost: 0.25
        } 
    },
    "medium": {
        "husk": {
            health: 5,
            speed: 2.5,
            stamGain: 0.2,
        }, 
        "virtue": {
            health: 16,
            speed: 1,
            stamGain: 0.4,
            strikeTimes: {
                "start":0,
                "charge":1500,
                "lock":3000,
                "fire":5000,
                "end":6000,
            },
            beamspeed: 2
        },
        "parryWindow": {
            timeMultiplier: 1
        },
        "player": {
            dashCost: 0.125,
            health: 4,
            maxHealth: 4,
            healCost: 0.5
        } 
    },
    "hard": {
        "husk": {
            health: 7,
            speed: 3.5,
            stamGain: 0.1,
        },
        "virtue": {
            health: 20,
            speed: 1,
            stamGain: 0.3,
            strikeTimes: {
                "start":0,
                "charge":750,
                "lock":2000,
                "fire":3000,
                "end":7000,
            },
            beamspeed: 3
        },
        "parryWindow": {
            timeMultiplier: 1
        },
        "player": {
            dashCost: 0.250,
            health: 3,
            maxHealth: 3,
            healCost: 0.66666
        }  
    },
    "brutal": {
        "husk": {
            health: 12,
            speed: 4,
            stamGain: 0.025,
        },
        "virtue": {
            health: 30,
            speed: 1,
            stamGain: 0.2,
            strikeTimes: {
                "start":0,
                "charge":750,
                "lock":3000,
                "fire":3200,
                "end":9000,
            },
            beamspeed: 3.7
        },
        "parryWindow": {
            timeMultiplier: 1
        },
        "player": {
            dashCost: 0.500,
            health: 2,
            maxHealth: 2,
            healCost: 0.8
        }  
    },
    "nightmare": {
        "husk": {
            health: 20,
            speed: 4.1,
            stamGain: 0.05,
        },
        "virtue": {
            health: 40,
            speed: 1,
            stamGain: 0.15,
            strikeTimes: {
                "start":0,
                "charge":750,
                "lock":2000,
                "fire":2200,
                "end":12000,
            },
            beamspeed: 4.1
        },
        "parryWindow": {
            timeMultiplier: 1
        },
        "player": {
            dashCost: 0.8,
            health: 1,
            maxHealth: 1,
            healCost: 1
        }  
    }
}

function changeDifficulty(diff) {
    difficulty = diff
    let playerOptions = {
        ...difficultySettings[difficulty].player,
    }
    for(let key in playerOptions) {
        player[key] = playerOptions[key]
    }
}

changeDifficulty("easy")