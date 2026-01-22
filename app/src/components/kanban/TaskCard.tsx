import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPriorityColor } from '@/lib/kanban-utils'
import type { Task } from '@/types'
import { GripVertical } from 'lucide-react'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-tight flex-1">
              {task.title}
            </CardTitle>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded"
              aria-label="Drag to move task"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        {(task.description || task.priority) && (
          <CardContent className="pt-0">
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            {task.priority && (
              <span
                className={cn(
                  'inline-block px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(task.priority)
                )}
              >
                {task.priority}
              </span>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

