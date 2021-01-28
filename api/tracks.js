const task = require("../models/task")

export default function(req, res) {
    return res.json({
        body: task.getAll(),
        headers: req.headers
    })
}