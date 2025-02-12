import { useState, useEffect } from 'react';

function ModalPanel({ setShowModal, onCreateTask }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('1');
    const [priority, setPriority] = useState('1');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [labelColor, setLabelColor] = useState('#FF6B6B');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');

    const labelColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
    ];

    const handleAddLabel = () => {
        if (newLabel.trim()) {
            const label = {
                text: newLabel.trim(),
                color: labelColor
            };
            setLabels([...labels, label]);
            setNewLabel('');
            setLabelColor(`#${Math.floor(Math.random()*16777215).toString(16)}`);
        }
    };

    const handleRemoveLabel = (index) => {
        setLabels(labels.filter((_, i) => i !== index));
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { text: newSubtask.trim(), completed: false }]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowModal(false);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [setShowModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newTask = {
            title,
            description,
            status: Number(status),
            priority: Number(priority),
            startDate: startDate || null,
            dueDate: dueDate || null,
            labels,
            subtasks
        };

        try {
            await onCreateTask(newTask);
            setShowModal(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-panel">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button className="close-button" onClick={() => setShowModal(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input required
                        type="text" 
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea required
                        placeholder="Task Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="1">To Do</option>
                        <option value="2">In Progress</option>
                        <option value="3">Done</option>
                    </select>
                    <div className="date-inputs">
                        <div className="date-input">
                            <label>Start Date (optional)</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-input">
                            <label>Due Date (optional)</label>
                            <input
                                type="date"
                                value={dueDate}
                                min={startDate} // Prevent due date before start date
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="priority-input">
                        <label>Priority (1-10)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            required
                        />
                    </div>

                    {/* Updated Labels Section */}
                    <div className="labels-section">
                        <label>Labels</label>
                        <div className="label-input-group">
                            <input
                                type="text"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Add a label"
                                className="label-text-input"
                            />
                            <input
                                type="color"
                                value={labelColor}
                                onChange={(e) => setLabelColor(e.target.value)}
                                className="label-color-picker"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddLabel}
                                className="add-label-btn"
                            >
                                Add
                            </button>
                        </div>
                        <div className="labels-container">
                            {labels.map((label, index) => (
                                <span 
                                    key={index} 
                                    className="label" 
                                    style={{ backgroundColor: label.color }}
                                >
                                    {label.text}
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveLabel(index)}
                                        className="remove-label"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="subtasks-section">
                        <label>Subtasks</label>
                        <div className="subtask-input">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add a subtask"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSubtask}
                                className="add-subtask-btn"
                            >
                                +
                            </button>
                        </div>
                        <div className="subtasks-container">
                            {subtasks.map((subtask, index) => (
                                <div key={index} className="subtask-item">
                                    <span>{subtask.text}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveSubtask(index)}
                                        className="remove-subtask"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="add-task-button">Add Task</button>
                </form>
            </div>
        </div>
    );
}

export default ModalPanel;