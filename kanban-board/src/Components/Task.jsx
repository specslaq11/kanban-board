import EditPanel from '../Components/EditPanel';
import { useState, useEffect } from 'react';

function Task({ task, columns, onStatusChange, onDelete, tasks, setTasks }) {
    const [editPanel, setEditPanel] = useState(false);

    // Update task's isEditing property when edit panel opens/closes
    useEffect(() => {
        setTasks(tasks.map(t => {
            if (t.id === task.id) {
                return { ...t, isEditing: editPanel };
            }
            return t;
        }));
    }, [editPanel]);

    return (
        <div onClick={() => setEditPanel(true)} className='item'>
            <button className='delete-button' onClick={(e) => {
                e.stopPropagation();  // Prevent opening edit panel when deleting
                onDelete(task.id);
            }}>x</button>
            <div className='task-content'>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
            </div>
            {editPanel && <EditPanel 
                setEditPanel={setEditPanel} 
                tasks={tasks} 
                setTasks={setTasks} 
                task={task}
            />}
        </div>
    )
}

export default Task 