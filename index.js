// Define a Neode Instance
const neode = require("neode")

    // Using configuration from .env file
    .fromEnv()

    // Including the models in the models/ directory
    .with({
        Movie: require("./models/Movie"),
        Person: require("./models/Person"),
        Actor: require("./models/Actor"),
        Director: require("./models/Director"),
        User: require("./models/User")
    });