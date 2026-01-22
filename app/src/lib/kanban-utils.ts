import type { Task, TaskStatus } from '@/types'

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status)
}

export function getColumnTitle(status: TaskStatus): string {
  const titles: Record<TaskStatus, string> = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'done': 'Done',
  }
  return titles[status]
}

export function getColumnColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    'todo': 'bg-slate-100 dark:bg-slate-800',
    'in-progress': 'bg-blue-50 dark:bg-blue-950',
    'done': 'bg-green-50 dark:bg-green-950',
  }
  return colors[status]
}

export function getPriorityColor(priority?: 'low' | 'medium' | 'high'): string {
  if (!priority) return 'bg-gray-200 dark:bg-gray-700'
  
  const colors = {
    'low': 'bg-blue-200 dark:bg-blue-800',
    'medium': 'bg-yellow-200 dark:bg-yellow-800',
    'high': 'bg-red-200 dark:bg-red-800',
  }
  return colors[priority]
}

