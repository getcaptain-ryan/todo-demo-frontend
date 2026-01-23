import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCreateDialog } from './TaskCreateDialog'
import type { AddTaskButtonProps } from '@/types'

export function AddTaskButton({ status }: AddTaskButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setDialogOpen(true)}
        className="h-8 w-8 p-0"
        aria-label="Add new task"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <TaskCreateDialog
        status={status}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

