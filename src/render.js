var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.textAlign = "center";

function render() {
    
    document.getElementById("myCanvas").width = window.innerWidth
    document.getElementById("myCanvas").height = window.innerHeight


    
    ctx.fillStyle="#000"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    ctx.translate(-camera.pos.x, -camera.pos.y);

    player.render()
    for(let obj of objects) {
        if(obj.render)obj.render()
        if(obj.renderSecondary)obj.renderSecondary()
        if(obj.renderTertiary)obj.renderTertiary()
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    renderUI()
}

setInterval(() => {
    render()
}, 1000/60);

function renderText(str, pos=v(0, 0), bounds=v(128,128), scale, type=redText) {
    let p = v(pos.x, pos.y)
    function renderKey(key, pos) {
        type.renderFromKeycodes(pos, key, v(scale, scale))
    }
    for (let i = 0; i < str.length; i++) {
        renderKey(str[i], p)
        p.x += 28*scale
    }
}








function renderUI() {
    let barBase = undefined

    //health
    let blockwidth = 50
    let blockspace = 10
    for(let blocknum = 0; blocknum < player.maxHealth; blocknum++) {
        
        barBase = window.innerWidth/2-player.maxHealth*(blockwidth+blockspace)/2+(blockspace/2)
        if(blocknum < player.health) ctx.fillStyle = player.customColour.health
        else ctx.fillStyle = player.customColour.emptyHealth
        ctx.fillRect(
            barBase+blocknum*(blockwidth+blockspace),
            window.innerHeight-100, 
            blockwidth, 
            20)
    }
    ctx.fillStyle = player.customColour.healingHealth
    ctx.fillRect(
        barBase+player.health*(blockwidth+blockspace),
        window.innerHeight-100, 
        blockwidth*(player.healTime/player.healTimeReqirement), 
        20
    )
    

    //stamina
    ctx.fillStyle = player.customColour.emptyStamina
    ctx.fillRect(barBase, window.innerHeight-150, 60*player.maxHealth-10, 20)
    ctx.fillStyle = player.customColour.stamina
    ctx.fillRect(barBase, window.innerHeight-150, player.stamina*(60*player.maxHealth-10), 20)

    renderText(difficulty, v(0, 0), undefined, 0.5)
}