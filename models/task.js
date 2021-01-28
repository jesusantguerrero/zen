const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

class Stock {
  constructor() {
    this.model = mongoose.model('tasks', new mongoose.Schema({
        user_uuid: String,
        title: String,
        description: String,
        due_date: Date,
        duration: Number,
        tags: Array,
        matrix: String,
    }));
  }

  getAll() {
    return this.model.find()
      .then((stock) => {
        return stocks;
      })
  }

  getOne(taskId) {
    return this.model.findOne({ _id: taskId})
        .then((stock) => {
        return stocks;
        })
  }


  create(task) {
    return this.model.create(task)
  }

  destroy(stockName) {
    return this.model.findOneAndDelete({  })
  }
}

module.exports = new Stock();