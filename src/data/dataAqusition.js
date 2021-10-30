const { InfluxDB } = require('@influxdata/influxdb-client');
const url = process.env.INFLUXURL
const token = process.env.INFLUXTOKEN
const org = process.env.INFLUXORG
const bucket = process.env.INFLUXBUCKET

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

function normalizer(linedata) {
    const { min, max } = linedata.reduce((previous, current) => {
        if (previous.min > current._value)
            return { max: previous.max, min: current._value }
        if (previous.max < current._value)
            return { max: current._value, min: previous.min }
        return previous;
    },{max:linedata[0]._value,min:linedata[0]._value});

    const valRange = max - min;
    const startMillis = new Date(linedata[0]._time).getTime();
    const stopStopMillis = new Date(linedata[linedata.length - 1]._time).getTime();
    const timeDifference = stopStopMillis - startMillis;

    return linedata.map((row) => {
        return {
            value: (row._value - min) / valRange,
            time: (new Date(row._time).getTime() - startMillis) / timeDifference,
        }
    });
}

async function getDirectionHistogram(measurementName,dirfieldname,daysPast){
    const startDay= daysPast-1;
    const query = `
    import "date"
    endd = date.truncate(t: -${startDay}d, unit: 1d)
    startd = date.truncate(t: -${daysPast}d, unit: 1d)

    meandir = from(bucket: "kotiluola")
    |> range(start: startd, stop: endd)
    |> filter(fn: (r) => r["_measurement"] == "${measurementName}")
    |> filter(fn: (r) => r["_field"] == "${dirfieldname}")
    |> aggregateWindow(every: 1h, fn: median, createEmpty: false)
    |>  pivot(
        rowKey:["_time"],
        columnKey: ["_field"],
        valueColumn: "_value")
    |> rename(columns:{"${dirfieldname}":"dir"})
    |> drop(columns:["_stop","_start","_measurement"])

    dircounts = meandir 
    |> histogram(bins:linearBins(start:0.0,width:10.0,count:36,infinity:false),column:"dir")
    |> yield()
    `
    console.log(query);
    const lines = await queryApi.collectRows(query);
    return lines.map((val,index,allLines)=>{
        val.num= index==0 ? val._value : val._value -allLines[index-1]._value; 
        return val
    });
}



async function collectDataFromDaysPast(measurementName,dirfieldname,strenghtfieldname,daysPast) {
    const startDay= daysPast-1;
    const query = `
    import "date"
    endd = date.truncate(t: -${startDay}d, unit: 1d)
    startd = date.truncate(t: -${daysPast}d, unit: 1d)

  meandir = from(bucket: "kotiluola")
  |> range(start: startd, stop: endd)
  |> filter(fn: (r) => r["_measurement"] == "${measurementName}")
  |> filter(fn: (r) => r["_field"] == "${dirfieldname}")
  |> aggregateWindow(every: 1h, fn: median, createEmpty: false)
  |>  pivot(
       rowKey:["_time"],
       columnKey: ["_field"],
       valueColumn: "_value")
  |> rename(columns:{"${dirfieldname}":"dir"})
  |> drop(columns:["_stop","_start","_measurement"])

  maxwind = from(bucket: "kotiluola")
  |> range(start: startd, stop: endd)
  |> filter(fn: (r) => r["_measurement"] == "${measurementName}")
  |> filter(fn: (r) => r["_field"] == "${strenghtfieldname}")
  |> aggregateWindow(every: 1h, fn: max, createEmpty: false)
  |>  pivot(
       rowKey:["_time"],
       columnKey: ["_field"],
       valueColumn: "_value")
  |> rename(columns:{"${strenghtfieldname}":"strenght"})
  |> drop(columns:["_stop","_start","_measurement"])

  minwind = from(bucket: "kotiluola")
  |> range(start: startd, stop: endd)
  |> filter(fn: (r) => r["_measurement"] == "${measurementName}")
  |> filter(fn: (r) => r["_field"] == "${strenghtfieldname}")
  |> aggregateWindow(every: 1h, fn: min, createEmpty: false)
  |>  pivot(
       rowKey:["_time"],
       columnKey: ["_field"],
       valueColumn: "_value")
  |> rename(columns:{"${strenghtfieldname}":"strenght"})
  |> drop(columns:["_stop","_start","_measurement"])
  
  
  dirplusmax = join(on: ["_time"], tables:{meandir: meandir, maxwind: maxwind})

  join(on: ["_time"], tables:{dirplusmax:dirplusmax, minwind:minwind})
    |> rename(columns:{"strenght_dirplusmax":"max","strenght_minwind":"min"})
    |> yield()
    `;
    console.log(query);
    const lines = await queryApi.collectRows(query);

    return lines;
}


module.exports = {
    collectDataFromDaysPast,
    getDirectionHistogram,
    normalizer
}
