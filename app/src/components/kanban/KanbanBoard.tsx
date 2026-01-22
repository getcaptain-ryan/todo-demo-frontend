import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useKanban } from '@/hooks/useKanban'
import { Button } from '@/components/ui/button'
import type { Task, TaskStatus } from '@/types'

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done']

export function KanbanBoard() {
  const {
    tasks,
    isLoading,
    error,
    refetch,
    moveTask,
    getTasksByStatus,
  } = useKanban()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">Error Loading Tasks</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Failed to load tasks. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

