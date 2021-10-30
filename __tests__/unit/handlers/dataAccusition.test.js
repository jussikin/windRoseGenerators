
describe('normalization calculations', () => { 
    beforeAll(() => { 

    }); 

    afterAll(() => { 
    }); 
 
    it('should normalize data as supposed',  () => { 
        const dataAccusation = require('../../../src/data/dataAqusition');
        const testDataIn = [
            {_value: 34, _time:'1995-12-17T03:24:00'},
            {_value: 36, _time:'1995-12-17T04:24:00'},
            {_value: 37, _time:'1995-12-17T05:24:00'}
        ]    
        const result = dataAccusation.normalizer(testDataIn);
        expect(result[0].value).toBe(0);
        expect(result[2].value).toBe(1);
        expect(result[0].time).toBe(0);
        expect(result[2].time).toBe(1);
        expect(result[1].value).toBeCloseTo(0.66666, 4);
        expect(result[1].time).toBeCloseTo(0.5, 4);
    }); 

    xit('should get some data from the server', async () => {
        const dataAccusation = require('../../../src/data/dataAqusition');
        const result = await dataAccusation.collectDataFromDaysPast('netatwind','winddir','winds',1)
        console.log(result);
    });

    it('should get some histogram data from the server', async () => {
        const dataAccusation = require('../../../src/data/dataAqusition');
        const result = await dataAccusation.getDirectionHistogram('netatwind','winddir',1)
        console.log(result);
    });
}); 
