/**
 * A basic example using Express to create a simple movie recommendation engine.
 */
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser')

/**
 * Load Neode with the variables stored in `.env` and tell neode to
 * look for models in the ./models directory.
 */
const neode = require('neode')
    .fromEnv()
    .withDirectory(path.join(__dirname, 'models'));

/**
 * Create a new Express instance
 */
const app = express();
/**
 * SCRF for AJAX requests used in /recommend/:genre
 */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * Set up a simple Session
 */
app.use(session({
    genid: function() {
        return require('uuid').v4();
    },
    resave: false,
    saveUninitialized: true,
    secret: 'neoderocks'
}));

/**
 * Serve anything inside the ./public folder as a static resource
 */
app.use(express.static('public'));
/**
 * For examples of how to use Neode to quickly generate a REST API,
 * checkout the route examples in ./routes.api.js
 */
app.use(require('./routes/api')(neode));
app.use(require('./routes/seeders')(neode));

/**
 * Listen for requests on port 3000
 */
app.listen(3000, function () {
    console.log('app listening on http://localhost:3000'); // eslint-disable-line no-console
});
