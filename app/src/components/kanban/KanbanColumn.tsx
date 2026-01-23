import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { getColumnTitle, getColumnColor } from '@/lib/kanban-utils'
import { TaskCard } from './TaskCard'
import { AddTaskButton } from './AddTaskButton'
import type { Task, TaskStatus } from '@/types'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const taskIds = tasks.map((task) => task.id)

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-4 px-1 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            {getColumnTitle(status)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        {/* Add Task Button */}
        <AddTaskButton status={status} />
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg p-4 transition-colors min-h-[500px]',
          getColumnColor(status),
          isOver && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

