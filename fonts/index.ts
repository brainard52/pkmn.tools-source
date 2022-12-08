import "/fonts/index.css"

function main() {
    updateMargin()
    window.onresize = updateMargin
}

function updateMargin(){
    let ratio = document.documentElement.clientWidth/document.documentElement.clientHeight
    let box = document.body as HTMLBodyElement;
    let margin = "0%"
    if (ratio >= 0.75) {
        margin =  `${100*(Math.sqrt(ratio-0.75)/10)}\%`
    }
    box.style.marginLeft = margin;
    box.style.marginRight = margin;
}

window.onload = main;
