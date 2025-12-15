'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KanbanBoardProps {
  tasks: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
}

const columns = {
  todo: { title: 'To Do', color: 'bg-gray-100/80 border-gray-200' },
  'in-progress': { title: 'In Progress', color: 'bg-blue-50/80 border-blue-100' },
  review: { title: 'Review', color: 'bg-purple-50/80 border-purple-100' },
  done: { title: 'Done', color: 'bg-green-50/80 border-green-100' },
};

export default function KanbanBoard({ tasks, onStatusChange, onTaskClick }: KanbanBoardProps) {
  const [enabled, setEnabled] = useState(false);

  // FIX: Hydration error fix for Drag & Drop in Next.js
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (result.source.droppableId !== destination.droppableId) {
        onStatusChange(draggableId, destination.droppableId);
    }
  };

  if (!enabled) {
    return <div className="p-4 text-center text-gray-500">Loading Board...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full min-h-[600px] overflow-x-auto pb-6">
        {Object.entries(columns).map(([statusKey, col]) => (
          <Droppable key={statusKey} droppableId={statusKey}>
            {(provided, snapshot) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className={`flex flex-col p-4 rounded-xl border ${col.color} transition-colors ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-200 bg-white' : ''}`}
              >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">{col.title}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-400 border border-gray-100">
                        {getTasksByStatus(statusKey).length}
                    </span>
                </div>
                
                <div className="space-y-3 flex-1">
                    {getTasksByStatus(statusKey).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => onTaskClick(task)}
                                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-indigo-500' : ''}`}
                                    style={provided.draggableProps.style}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {task.priority}
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">{task.title}</h4>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-2 text-[10px]">
                                                {task.assignees?.[0]?.name?.charAt(0) || <User size={10}/>}
                                            </div>
                                            {task.assignees?.[0]?.name?.split(' ')[0]}
                                        </div>
                                        {task.subtasks?.length > 0 && (
                                            <div className="flex items-center text-xs text-gray-400" title="Subtasks">
                                                <CheckSquare size={12} className="mr-1"/>
                                                {task.subtasks.filter((s:any)=>s.completed).length}/{task.subtasks.length}
                                            </div>
                                        )}
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