var tasks = require('../models/task');

module.exports = function (router) {

    router.get('/tasks', function(req, res) {
        tasks.find({}, (err, docs) => {
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
}