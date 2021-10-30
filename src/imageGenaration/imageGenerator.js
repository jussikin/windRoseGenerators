const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')

// register window and document
registerWindow(window, document)

const WIDTH = 400;
const HEIGHT = 400;
const maxRad = HEIGHT/3;
var pi = Math.PI;
const conversion = pi/180;
const centerx = WIDTH>>1;
const centery = HEIGHT>>1;
const scalevalue = 20;

function givePolygon(current){
    let px = centerx + Math.cos(current.dir*conversion)*current.max*scalevalue;
    let py = centery + Math.sin(current.dir*conversion)*current.max*scalevalue;
    let mx = centerx + Math.cos(current.dir*conversion)*current.min*scalevalue;
    let my = centery + Math.sin(current.dir*conversion)*current.min*scalevalue;
    let mxlb = centerx + Math.cos((current.dir*conversion)+1)*current.othersInSlot;
    let mylb = centery + Math.sin((current.dir*conversion)+1)*current.othersInSlot;
    let mxlr = centerx + Math.cos((current.dir*conversion)-1)*current.othersInSlot;
    let mylr = centery + Math.sin((current.dir*conversion)-1)*current.othersInSlot;
    return [[px,py],[mxlb,mylb],[mx,my],[mxlr,mylr]];
}

function addDataIntoImage(img,dataArray,fillStyle){
   dataArray.map(givePolygon).map((item) =>
        img.polygon(item).fill('#f06').stroke({ width: 1 })        
   );
}

function generateBaseImage() {
    const canvas = SVG(document.documentElement);
    return canvas;
}

module.exports = {
    addDataIntoImage,
    generateBaseImage
}