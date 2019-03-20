var tasks = require('../models/task'),
    express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    tasks.find({}, (err, docs) => {
        if (err) {
            res.status(500).send({
                message: 'Server error',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: docs
            })
        }
    })
})


module.exports = router;