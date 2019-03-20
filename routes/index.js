/*
 * Connect all of your endpoints together here.
 */

var tasks = require('./tasks');
var users = require('./users');

module.exports = function (app, router) {
    app.use('/api', require('./home.js')(router));
    app.use('/api/users', users);
    app.use('/api/tasks', tasks);
};
