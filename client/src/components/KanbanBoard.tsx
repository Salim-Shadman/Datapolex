'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User, Clock } from 'lucide-react';

interface KanbanBoardProps {
  tasks: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
}

const columns = {
  todo: { title: 'To Do', color: 'bg-gray-100' },
  'in-progress': { title: 'In Progress', color: 'bg-blue-50' },
  review: { title: 'Review', color: 'bg-purple-50' },
  done: { title: 'Done', color: 'bg-green-50' },
};

export default function KanbanBoard({ tasks, onStatusChange, onTaskClick }: KanbanBoardProps) {
  
  // Group tasks by status
  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    // Call parent to update API
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {Object.entries(columns).map(([statusKey, col]) => (
          <Droppable key={statusKey} droppableId={statusKey}>
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className={`p-4 rounded-lg min-h-[500px] ${col.color}`}
              >
                <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">{col.title}</h3>
                
                <div className="space-y-3">
                    {getTasksByStatus(statusKey).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => onTaskClick(task)}
                                    className="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`w-2 h-2 rounded-full mt-1 ${task.priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        <span className="text-xs text-gray-400 font-mono">#{task.estimate}h</span>
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">{task.title}</h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center"><User size={12} className="mr-1"/> {task.assignees?.[0]?.name?.split(' ')[0] || '-'}</div>
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}