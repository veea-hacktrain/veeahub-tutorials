// https://www.tinkerforge.com/en/doc/Software/IPConnection_JavaScript.html
const Tinkerforge = require('tinkerforge');
const express = require('express');
const webapp = express();

const HOST = 'localhost';
const PORT = 4223;

let devices = {};
let conns = {};

ipcon = new Tinkerforge.IPConnection(); // Create IP connection
ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Could not connect to brickd')
        console.log('Error: ' + error);
        process.exit(2);
    }
);

// Register Connected Callback
ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        // Trigger Enumerate
        console.info("Connected to brickd")
        ipcon.enumerate();
    }
);

// Register Enumerate Callback
ipcon.on(Tinkerforge.IPConnection.CALLBACK_ENUMERATE,
    // Print incoming enumeration
    (uid, connectedUid, position, hardwareVersion, firmwareVersion,
        deviceIdentifier, enumerationType) => {
        devices[uid] = {
            uid, enumerationType, connectedUid, position, hardwareVersion,
            firmwareVersion, deviceIdentifier,
        }
    }
);

webapp.set('view engine', 'ejs');

webapp.get('/', (req, res) => res.render('index.ejs'))
webapp.use('/static', express.static('./static'));
webapp.get('/api/v1/device', (req, res) => {
    res.json(devices);
});
webapp.get('/api/v1/device/:uid', (req, res) => {
    var uid = req.param('uid');
    const dev = devices[uid];

    if (dev && !conns[uid]) {
        conns[uid] = new Tinkerforge.BrickletTemperature(uid, ipcon); // Create device object
        conns[uid].setTemperatureCallbackPeriod(1000);
        conns[uid].on(Tinkerforge.BrickletTemperature.CALLBACK_TEMPERATURE,
            // Callback function for temperature callback
            function (temperature) {
                console.log('Temperature: ' + temperature / 100.0 + ' °C');
                dev.temperature = temperature / 100.0;
            }
        );

        dev.temperature = null;
    }

    if (!devices[uid]) {
        res.status(404).send();
        return
    }

    res.json(devices[uid]);
});

const port = process.env.WEB_LISTEN_PORT||8088;
webapp.listen(port, () => console.log(`Example app listening on port ${port}!`))

console.log("Press Ctrl+c to exit ...");
process.stdin.on('data',
    (data) => {
        ipcon.disconnect();
        process.exit(0);
    }
);
