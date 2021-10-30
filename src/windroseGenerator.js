const dataAccusation = require('./data/dataAqusition');
const imageGenerator = require('./imageGenaration/imageGenerator');
const streams = require('memory-streams');

async function generateWindRoseImage(dayspast) {
    const result1 = await dataAccusation.collectDataFromDaysPast('netatwind', 'winddir', 'winds', dayspast);
    const histogram = await dataAccusation.getDirectionHistogram('netatwind', 'winddir', dayspast);
    const data = result1.map((dataitem) => {
        const slot = histogram.find((item) => {
            return dataitem.dir<item.le;
        });
        if(slot){
            dataitem.slot=slot.le;
            dataitem.othersInSlot=slot._value;
        }
        return dataitem
    });
    let img = imageGenerator.generateBaseImage();
    const memoryStream = new streams.WritableStream();
    imageGenerator.addDataIntoImage(img,data,'rgba(255,0,0, 0.5)');
    const text = img.svg();
    console.log(text);
    return text;
}

module.exports={generateWindRoseImage}
