import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HelloWorld() {
  const handleClick = () => {
    alert('Hello from React 19 + Vite + TypeScript!')
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Hello World</CardTitle>
          <CardDescription>
            React 19 + Vite + TypeScript + Tailwind + Shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Your frontend application is successfully set up and running!
          </p>
          <Button onClick={handleClick} className="w-full">
            Click Me
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

