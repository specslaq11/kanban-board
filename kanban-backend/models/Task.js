const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    text: String,
    color: String
});

const subtaskSchema = new mongoose.Schema({
    text: String,
    completed: {
        type: Boolean,
        default: false
    }
});

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: Number,
        required: true,
        default: 1
    },
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 1
    },
    startDate: Date,
    dueDate: Date,
    labels: [labelSchema],
    subtasks: [subtaskSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema); 