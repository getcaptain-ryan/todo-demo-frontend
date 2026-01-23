import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskCreateForm } from './TaskCreateForm'
import { getColumnTitle } from '@/lib/kanban-utils'
import type { TaskCreateDialogProps } from '@/types'

export function TaskCreateDialog({ status, open, onOpenChange }: TaskCreateDialogProps) {
  const columnTitle = getColumnTitle(status)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to the <strong>{columnTitle}</strong> column.
            Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <TaskCreateForm
          status={status}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}

