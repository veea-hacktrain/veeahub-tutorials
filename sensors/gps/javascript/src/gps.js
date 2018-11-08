const express = require('express');
const fetch = require('node-fetch');
const webapp = express();

// We use ejs to interpolate our data and templates
webapp.set('view engine', 'ejs');

// Render a basic index page
webapp.get('/', (req, res) => res.render('index.ejs'))
// Provide javascript assets
webapp.use('/static', express.static('./static'));
// Example of accessing the MyNode service
webapp.use('/latest', (req, res) => {
    fetch('http://169.254.169.250:5666/latest').then((resp) => {
        return resp.json();
    }).then((latest) => {
        res.send(latest);
    }).catch((e) => {
        console.log(e)
        res.status(500);
    })
})

// Start our webservice
const port = process.env.WEB_LISTEN_PORT || 8088;
webapp.listen(port, () => console.log(`Example app listening on port ${port}!`))
