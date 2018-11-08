// https://www.tinkerforge.com/en/doc/Software/IPConnection_JavaScript.html
const Tinkerforge = require('tinkerforge');
const express = require('express');
const webapp = express();

// Connection details for brickd. As we run brickd locally in our container we
// can just access it at localhost
const HOST = 'localhost';
const PORT = 4223;

// Store devices and connections here
let devices = {};
let conns = {};

// Create an IP connection to our brickd. If it fails then exit out.
ipcon = new Tinkerforge.IPConnection();
ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Could not connect to brickd')
        console.log('Error: ' + error);
        process.exit(2);
    }
);

// Register Connected Callback
// When we get a connection to brickd we should ask it for all of the devices
ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        // Trigger Enumerate
        console.info("Connected to brickd")
        ipcon.enumerate();
    }
);

// Register Enumerate Callback
// Once the devices have been enumerated we can add them to our cache.
// Note: We don't track new devices as they come online, or even trigger a
// periodic enumerate. So all devices must be connected at the start.
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

// We use ejs to interpolate our data and templates
webapp.set('view engine', 'ejs');

// Render a basic index page
webapp.get('/', (req, res) => res.render('index.ejs'))
// Provide javascript assets
webapp.use('/static', express.static('./static'));
// List all of the devices
webapp.get('/api/v1/device', (req, res) => {
    res.json(devices);
});
// Get all of the temperature details for the device and ask for updates from it
// every second. Save the temperature details in the global variable at the top
// This could easily be extended to other sensors by checking on the device type
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

// Start our webservice
const port = process.env.WEB_LISTEN_PORT||8088;
webapp.listen(port, () => console.log(`Example app listening on port ${port}!`))

// If anything is written to Stdin then disconnect and shutdown
console.log("Press Ctrl+c to exit ...");
process.stdin.on('data',
    (data) => {
        ipcon.disconnect();
        process.exit(0);
    }
);
