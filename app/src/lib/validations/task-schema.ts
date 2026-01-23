import { z } from 'zod'
import type { TaskStatus } from '@/types'

/**
 * Zod schema for task creation form validation
 */
export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters') // Updated to match DB VARCHAR(200)
    .trim(),

  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')), // No max limit - DB uses TEXT field

  status: z.enum(['todo', 'in-progress', 'done']),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateSchema>

/**
 * Default form values
 */
export function getDefaultTaskFormValues(status: TaskStatus): TaskCreateFormValues {
  return {
    title: '',
    description: '',
    status,
  }
}

