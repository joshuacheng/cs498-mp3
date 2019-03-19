var users = require('../models/user');

module.exports = function (router) {

    router.get('/users', function (req, res) {
        users.find({}, (err, docs) => {
            if (err) {
                res.status(500).send({
                    message: 'Server error',
                    data: []
                })
            } else {
                res.status(200).send({
                    message: 'OK',
                    data: docs
                })
            }
        })
    })

    return router;
};