import { useState, useEffect } from 'react'
import './App.css'
import Task from './Components/Task'
import ModalPanel from './Components/ModalPanel'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Header from './Components/Header'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './Components/Login'
import Register from './Components/Register'
import { api } from './services/api'

function KanbanBoard() {
  const { currentUser, token } = useAuth();
  const [showModal, setShowModal] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Fetch tasks when user logs in
  useEffect(() => {
    if (currentUser && token) {
      api.getTasks(token)
        .then(fetchedTasks => setTasks(fetchedTasks))
        .catch(error => console.error('Error fetching tasks:', error));
    } else {
      // Clear tasks when user logs out
      setTasks([]);
    }
  }, [currentUser, token]);

  const onDragStart = () => {
    document.body.classList.add('dragging');
  };

  const onDragEnd = async (result) => {
    document.body.classList.remove('dragging');
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Get the task that was dragged
    const task = tasks.find(t => t._id === result.draggableId);
    const updatedTask = { ...task, status: Number(destination.droppableId) };
    
    // Optimistically update UI
    setTasks(tasks.map(t => {
      if (t._id === task._id) {
        return updatedTask;
      }
      return t;
    }));

    // Update in backend
    try {
      await api.updateTask(task._id, updatedTask, token);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setTasks(tasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId, token);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTask = await api.updateTask(taskId, updates, token);
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      const createdTask = await api.createTask(newTask, token);
      setTasks([...tasks, createdTask]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const [columns] = useState([
    {
      id: 1,
      title: 'To Do',
      items: []
    },
    {
      id: 2,
      title: 'In Progress',
      items: []
    },
    {
      id: 3,
      title: 'Done',
      items: []
    }
  ]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => {
    const searchLower = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.labels?.some(label => label.text.toLowerCase().includes(searchLower)) ||
      task.subtasks?.some(subtask => subtask.text.toLowerCase().includes(searchLower))
    );
  });

  if (!currentUser) {
    return (
      <div className={`kanban-board ${darkMode ? 'dark-mode' : ''}`}>
        <Header 
          onSearch={() => {}}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setShowModal={setShowModal}
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
        />
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
        {showRegister && <Register onClose={() => setShowRegister(false)} />}
        <div className="auth-message">
          Please log in or register to view your tasks
        </div>
      </div>
    );
  }

  return (
    <div className={`kanban-board ${darkMode ? 'dark-mode' : ''}`}>
      <Header 
        onSearch={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setShowModal={setShowModal}
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
      />
      {showModal && (
        <ModalPanel 
          setShowModal={setShowModal} 
          tasks={tasks} 
          setTasks={setTasks}
          onCreateTask={handleCreateTask}
        />
      )}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="columns-container">
          {columns.map((column) => (
            <div key={column.id} className='column'>
              <h2>{column.title}</h2>
              <Droppable 
                droppableId={column.id.toString()}
                isDropDisabled={false}
              >
                {(provided) => (
                  <div 
                    className='items-container'
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {filteredTasks
                      .filter(task => task.status === column.id)
                      .map((task, index) => (
                        <Draggable 
                          key={task._id} 
                          draggableId={task._id.toString()} 
                          index={index}
                          isDragDisabled={task.isEditing || false}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Task
                                task={task}
                                columns={columns}
                                tasks={tasks}
                                setTasks={setTasks}
                                onDelete={handleDeleteTask}
                                onUpdate={handleUpdateTask}
                              />
                            </div>
                          )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

// Wrap the KanbanBoard with AuthProvider
function App() {
  return (
    <AuthProvider>
      <KanbanBoard />
    </AuthProvider>
  );
}

export default App;
