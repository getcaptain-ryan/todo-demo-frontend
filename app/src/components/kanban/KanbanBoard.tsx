import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useKanban } from '@/hooks/useKanban'
import type { Task, TaskStatus } from '@/types'

// Mock data for demonstration
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new landing page',
    status: 'todo',
    priority: 'high',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add JWT-based authentication to the API',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add test coverage for user service',
    status: 'todo',
    priority: 'medium',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '4',
    title: 'Deploy to production',
    description: 'Deploy version 1.0 to production environment',
    status: 'done',
    priority: 'high',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
  },
]

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done']

export function KanbanBoard() {
  const { tasks, moveTask, getTasksByStatus } = useKanban(MOCK_TASKS)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Check if the drop target is a valid column
    if (COLUMNS.includes(newStatus)) {
      moveTask(taskId, newStatus)
    }

    setActiveTask(null)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

