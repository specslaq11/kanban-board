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

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Calculate background opacity based on priority
    const getBackgroundStyle = (priority) => {
        const opacity = (priority || 1) / 10;
        return {
            '--opacity': opacity * 0.4, // Store opacity as CSS variable
            backgroundColor: `rgba(193, 127, 89, ${opacity * 0.4})`,
        };
    };

    const calculateSubtaskProgress = () => {
        if (!task.subtasks?.length) return 0;
        const completed = task.subtasks.filter(st => st.completed).length;
        return (completed / task.subtasks.length) * 100;
    };

    const toggleSubtask = (subtaskIndex) => {
        const updatedTasks = tasks.map(t => {
            if (t.id === task.id) {
                const updatedSubtasks = [...t.subtasks];
                updatedSubtasks[subtaskIndex] = {
                    ...updatedSubtasks[subtaskIndex],
                    completed: !updatedSubtasks[subtaskIndex].completed
                };
                return { ...t, subtasks: updatedSubtasks };
            }
            return t;
        });
        setTasks(updatedTasks);
    };

    return (
        <>
            <div 
                onClick={() => setEditPanel(true)} 
                className='item'
                style={getBackgroundStyle(task.priority)}
            >
                <button 
                    className='delete-button' 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                >
                    ×
                </button>
                <div className='task-content'>
                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                        <div className="task-labels">
                            {task.labels.map((label, index) => (
                                <span 
                                    key={index}
                                    className="label"
                                    style={{ backgroundColor: label.color }}
                                >
                                    {label.text}
                                </span>
                            ))}
                        </div>
                    )}

                    <h3>{task.title}</h3>
                    <p>{task.description}</p>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="task-subtasks" onClick={e => e.stopPropagation()}>
                            {task.subtasks.map((subtask, index) => (
                                <div 
                                    key={index}
                                    className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => toggleSubtask(index)}
                                    />
                                    <span>{subtask.text}</span>
                                </div>
                            ))}
                            <div className="subtasks-progress">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${calculateSubtaskProgress()}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {(task.startDate || task.dueDate) && (
                        <div className="task-dates">
                            {task.startDate && (
                                <span className="date start-date">
                                    Start: {formatDate(task.startDate)}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="date due-date">
                                    Due: {formatDate(task.dueDate)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {editPanel && (
                <div className="edit-panel-wrapper" onClick={(e) => {
                    if (e.target === e.currentTarget) setEditPanel(false);
                }}>
                    <EditPanel 
                        setEditPanel={setEditPanel} 
                        tasks={tasks} 
                        setTasks={setTasks} 
                        task={task}
                    />
                </div>
            )}
        </>
    );
}

export default Task; 