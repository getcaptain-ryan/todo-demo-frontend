import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useKanban } from '@/hooks/useKanban'
import { taskCreateSchema, getDefaultTaskFormValues } from '@/lib/validations/task-schema'
import type { TaskCreateFormValues } from '@/lib/validations/task-schema'
import type { TaskCreateFormProps } from '@/types'

export function TaskCreateForm({ status, onSuccess, onCancel }: TaskCreateFormProps) {
  const { addTask, isCreating } = useKanban()

  console.log('TaskCreateForm rendered - status:', status, 'isCreating:', isCreating, 'addTask:', typeof addTask)

  // Initialize form with react-hook-form and Zod validation
  const form = useForm<TaskCreateFormValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: getDefaultTaskFormValues(status),
  })

  console.log('Form state:', {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
  })

  // Handle form submission
  const onSubmit = async (data: TaskCreateFormValues) => {
    console.log('onSubmit called with data:', data)
    try {
      // Call addTask from useKanban hook
      addTask({
        title: data.title,
        description: data.description || undefined,
        status: data.status,
      })

      // Reset form and close dialog on success
      form.reset()
      onSuccess()
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Failed to create task:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task title..."
                  {...field}
                  disabled={isCreating}
                  autoFocus
                />
              </FormControl>
              <FormDescription>
                A clear, concise title for your task (3-200 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about this task..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={isCreating}
                />
              </FormControl>
              <FormDescription>
                Optional details about the task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            onClick={(e) => {
              console.log('Submit button clicked', e)
            }}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

