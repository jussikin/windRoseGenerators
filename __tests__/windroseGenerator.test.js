describe('windroseGenerator', () => { 
    beforeAll(() => { 

    }); 

    afterAll(() => { 
    }); 
 
    it('collects and combines data correctly 666',async()=>{
        const generator = require('../src/windroseGenerator');
        const fs = require('fs');
        const result = await generator.generateWindRoseImage(1);
        fs.writeFileSync('test.png',result);
    });
});