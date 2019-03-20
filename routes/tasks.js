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

router.post('/', function (req, res) {
    if (req.body.name && req.body.deadline) {
        console.log('success');
        tasks.create({
            name: req.body.name,
            deadline: req.body.deadline
        }, (err, createdTask) => {
            res.status(200).send({
                message: 'OK',
                data: createdTask
            })
        })
        
    } else {
        res.status(404).send({
            message: 'Task requires name and deadline',
            data: {}
        })
    }
})


module.exports = router;