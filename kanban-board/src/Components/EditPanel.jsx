import { useState, useEffect } from 'react';

function EditPanel({ setEditPanel, tasks, setTasks, task }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [status, setStatus] = useState(task.status.toString());

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

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const updatedTasks = tasks.map(t => {
            if (t.id === task.id) {
                return {
                    ...t,
                    title,
                    description,
                    status: Number(status),
                    isEditing: false
                };
            }
            return t;
        });
        
        setTasks(updatedTasks);
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
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="1">To Do</option>
                        <option value="2">In Progress</option>
                        <option value="3">Done</option>
                    </select>
                    <button type="submit">Update Task</button>
                </form>
            </div>
        </div>
    );
}

export default EditPanel;