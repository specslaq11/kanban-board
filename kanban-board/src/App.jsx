import { useState, useEffect } from 'react'
import './App.css'
import Task from './Components/Task'
import ModalPanel from './Components/ModalPanel'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Header from './Components/Header'

function App() {
  const onDragStart = () => {
    document.body.classList.add('dragging');
  };

  const onDragEnd = (result) => {
    document.body.classList.remove('dragging');
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Get the task that was dragged
    const task = tasks.find(t => t.id === Number(result.draggableId));
    
    // Update its status to the new column's id
    setTasks(tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, status: Number(destination.droppableId) };
      }
      return t;
    }));
  };

  const [columns, setColumns] = useState([
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
  ])

  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      {
        id: 1,
        title: "Learn React",
        description: "Study React fundamentals",
        status: 1
      },
      {
        id: 2,
        title: "Build Project",
        description: "Create a Kanban board",
        status: 2
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [showModal, setShowModal] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className={`kanban-board ${darkMode ? 'dark-mode' : ''}`}>
      <Header 
        onSearch={handleSearch}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setShowModal={setShowModal}
      />
      {showModal && <ModalPanel setShowModal={setShowModal} tasks={tasks} setTasks={setTasks} />}
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
                          key={task.id} 
                          draggableId={task.id.toString()} 
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
                                onDelete={(taskId) => {
                                  setTasks(tasks.filter(t => t.id !== taskId));
                                }}
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
  )
}

export default App
