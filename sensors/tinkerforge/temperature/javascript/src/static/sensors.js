const movingAvgInSeconds = 300;

// Create the plot
Plotly.plot('graph', [{
    x: [],
    y: [],
    mode: 'lines',
    line: { color: '#80CAF6' },
    name: 'Live Temperature'
}, {
    x: [],
    y: [],
    mode: 'lines',
    line: { color: '#0DFFA2' },
    name: `${movingAvgInSeconds}s Moving Average`
}]);


// fetchTempSensor connects to the local API to fetch all of the devices
// and filter for just one temperature sensor
async function fetchTempSensor() {
    const tempSensorResp = await fetch("/api/v1/device")
    const devices = await tempSensorResp.json();

    const tempDeviceIdentifier = 216;
    const tempSensors = Object.values(devices)
        .filter((dev) => dev.deviceIdentifier === tempDeviceIdentifier);

    // Just use the first attached temperature sensor
    // you could extend this to graph multiple sensors on the
    // same graph.
    if (tempSensors.length >= 1) {
        return tempSensors[0];
    }

    return null
}

// startTimer will make API calls to get the temperature every 2.5s
async function startTimer(tempSensor) {
    const pollIntervalInMs = 2500;
    const movingAvgReadingCount = (movingAvgInSeconds * 1000) / pollIntervalInMs;
    const movingAvgWindow = [];

    setInterval(async () => {
        const sensorResponse = await fetch(`/api/v1/device/${tempSensor.uid}`)
        const sensor = await sensorResponse.json();

        if (sensor.temperature) {
            // Cap the number of moving average readings
            if (movingAvgWindow.length >= movingAvgReadingCount) {
                movingAvgWindow.shift();
            }

            // Add the latest reading to the moving average readings
            movingAvgWindow.push(sensor.temperature);

            const movingAverage = movingAvgWindow.map((reading, _idx, arr) => {
                return reading / arr.length;
            }).reduce((sum, reading, _idx) => {
                return sum + reading;
            }, 0);

            const now = new Date();
            let xs = [];
            let ys = [];
            let traces = [0, 1];

            if (movingAvgWindow.length >= movingAvgReadingCount) {
                xs.push([now], [now])
                ys.push([sensor.temperature], [movingAverage]);
            } else {
                xs.push([now], [])
                ys.push([sensor.temperature], []);
            }


            Plotly.extendTraces('graph', {
                x: xs,
                y: ys,
            }, traces)
        }
    }, pollIntervalInMs);
}

// main is the entrypoint to the script
async function main() {
    const tempSensor = await fetchTempSensor();

    if (!tempSensor) {
        console.error("Expected to find a temperature sensor but didn't")
        return
    }

    startTimer(tempSensor);
}

main()
