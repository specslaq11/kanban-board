const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Get all tasks for user
router.get('/', async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// Create new task
router.post('/', async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

// Update task
router.put('/:id', async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(task);
    } catch (error) {
        next(error);
    }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 