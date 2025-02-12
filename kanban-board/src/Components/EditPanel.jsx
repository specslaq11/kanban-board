import { useState, useEffect } from 'react';

function EditPanel({ setEditPanel, tasks, setTasks, task }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [status, setStatus] = useState(task.status.toString());
    const [priority, setPriority] = useState(task.priority?.toString() || '1');
    const [startDate, setStartDate] = useState(task.startDate || '');
    const [dueDate, setDueDate] = useState(task.dueDate || '');
    const [labels, setLabels] = useState(task.labels || []);
    const [newLabel, setNewLabel] = useState('');
    const [labelColor, setLabelColor] = useState('#FF6B6B');
    const [subtasks, setSubtasks] = useState(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closePanel();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const closePanel = () => {
        setTasks(tasks.map(t => {
            if (t.id === task.id) {
                return { ...t, isEditing: false };
            }
            return t;
        }));
        setEditPanel(false);
    };

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
            setSubtasks([...subtasks, { 
                text: newSubtask.trim(), 
                completed: false 
            }]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const toggleSubtask = (index) => {
        setSubtasks(subtasks.map((st, i) => 
            i === index ? { ...st, completed: !st.completed } : st
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setTasks(tasks.map(t => {
            if (t.id === task.id) {
                return {
                    ...t,
                    title,
                    description,
                    status: Number(status),
                    priority: Number(priority),
                    startDate,
                    dueDate,
                    labels,
                    subtasks,
                    isEditing: false
                };
            }
            return t;
        }));
        
        setEditPanel(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closePanel();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Task</h2>
                    <button 
                        className="close-button"
                        onClick={closePanel}
                    >
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea 
                        placeholder="Task Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    
                    {/* Labels Section */}
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
                                className="subtask-text-input"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSubtask}
                                className="add-subtask-btn"
                            >
                                Add
                            </button>
                        </div>
                        <div className="subtasks-container">
                            {subtasks.map((subtask, index) => (
                                <div key={index} className="subtask-item">
                                    <input
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => toggleSubtask(index)}
                                    />
                                    <span className={subtask.completed ? 'completed' : ''}>
                                        {subtask.text}
                                    </span>
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
                                min={startDate}
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
                    <button type="submit" className="update-button">Update Task</button>
                </form>
            </div>
        </div>
    );
}

export default EditPanel;