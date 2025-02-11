import { useState, useEffect } from 'react';

function ModalPanel({ setShowModal, tasks, setTasks }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('1');

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

    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent form from submitting normally
        const newTask = {
            id: tasks.length + 1,
            title: title,
            description: description,
            status: Number(status)
        }
        setTasks([...tasks, newTask]);
        setShowModal(false);
    }

    return (
        <div className="modal-overlay">
            <div className="modal-panel">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button 
                        className="close-button"
                        onClick={() => setShowModal(false)}
                    >
                        x
                    </button>
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
                    <button type="submit">Add Task</button>
                </form>
            </div>
        </div>
    )
}

export default ModalPanel;