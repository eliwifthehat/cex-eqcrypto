import { useAuth } from '@/components/AuthProvider'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AuthButton() {
  const { user, signOut } = useAuth()
  const [, setLocation] = useLocation()

  if (!user) {
    return (
      <Button 
        onClick={() => setLocation('/auth')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <User className="h-4 w-4 mr-2" />
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-gray-700">
        <DropdownMenuItem 
          onClick={signOut}
          className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}