var tasks = require('../models/task'),
    express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    tasks.find({}, function (err, docs) {
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

router.get('/:id', function (req, res) {
    tasks.findOne({_id: req.params.id}, function (err, foundTask) {
        if (err) {
            res.status(404).send({
                message: '404 Task Not Found',
                data: {}
            })
        } else {
            res.status(200).send({
                message: 'OK',
                data: foundTask
            })
        }
    })
})

router.post('/', function (req, res) {
    if (req.body.name && req.body.deadline) {
        console.log('success');

        /*REVIEW:
        *  figure out best way to handle writing
        *  all the properties into the new task object
        *  https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms 
        */
        tasks.create({
            name: req.body.name,
            deadline: req.body.deadline,
            description: req.body.description || "",
            completed: req.body.completed || false,
            assignedUser: req.body.assignedUser || "",
            assignedUserName: req.body.assignedUserName || "unassigned"
        }, function (err, createdTask) {
            if (err) {
                /* Check for cast errors */
                if (Object.keys(err.errors).some(error => {
                    return err.errors[error].name === 'CastError'
                })) {
                    res.status(404).send({
                        message: 'A task field is of the wrong type',
                        data: {}
                    })
                }
            } else {
                res.status(200).send({
                    message: 'POST /tasks successful',
                    data: createdTask
                })
            }
        })
        
    } else {
        res.status(404).send({
            message: 'Task requires name and deadline',
            data: {}
        })
    }
})


module.exports = router;