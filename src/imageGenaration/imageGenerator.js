const PImage = require('pureimage');

const WIDTH = 400;
const HEIGHT = 400;
const maxRad = HEIGHT/3;
var pi = Math.PI;
const conversion = pi/180;
const centerx = WIDTH>>1;
const centery = HEIGHT>>1;
const scalevalue = 20;

function addDataIntoImage(img,dataArray,fillStyle){
   
    dataArray.reduce((prev,current)=>{
        var ctx = img.getContext('2d');
        ctx.fillStyle = fillStyle;
        console.log(current);
        let px = centerx + Math.cos(current.dir*conversion)*current.max*scalevalue;
        let py = centery + Math.sin(current.dir*conversion)*current.max*scalevalue;
        let mx = centerx + Math.cos(current.dir*conversion)*current.min*scalevalue;
        let my = centery + Math.sin(current.dir*conversion)*current.min*scalevalue;
        let mxlb = centerx + Math.cos((current.dir*conversion)+1)*current.othersInSlot;
        let mylb = centery + Math.sin((current.dir*conversion)+1)*current.othersInSlot;
        let mxlr = centerx + Math.cos((current.dir*conversion)-1)*current.othersInSlot;
        let mylr = centery + Math.sin((current.dir*conversion)-1)*current.othersInSlot;

        ctx.beginPath();
        ctx.moveTo(px,py);
        ctx.lineTo(mxlb,mylb);
        ctx.lineTo(mx,my);
        ctx.lineTo(mxlr,mylr);
        ctx.lineTo(px,py);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        return {px,py};
    },false);
}

async function writeImageDataToStream(img,stream){
    await PImage.encodePNGToStream(img, stream);
}

function generateBaseImage() {
    return PImage.make(WIDTH, HEIGHT);
}


module.exports = {
    generateBaseImage,
    addDataIntoImage,
    writeImageDataToStream
}