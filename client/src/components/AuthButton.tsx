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
  const { user } = useAuth()
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

  // Return null when user is logged in - UserDropdown handles logged-in state
  return null
}