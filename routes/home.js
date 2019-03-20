var secrets = require('../config/secrets');

// function way of exporting router
// see users.js for the other way
module.exports = function (router) {

    var homeRoute = router.route('/');

    homeRoute.get(function (req, res) {
        var connectionString = secrets.token;
        res.json({ message: 'My connection string is ' + connectionString });
    });

    return router;
}
