import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void
  reset?: boolean
}

export function SimpleCaptcha({ onVerify, reset }: SimpleCaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(result)
    setUserInput('')
    setIsVerified(false)
    onVerify(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  useEffect(() => {
    if (reset) {
      generateCaptcha()
    }
  }, [reset])

  const handleVerify = () => {
    const isValid = userInput.toUpperCase() === captchaCode
    setIsVerified(isValid)
    onVerify(isValid)
  }

  return (
    <div className="space-y-3">
      <Label className="text-gray-300">Security Verification</Label>
      <div className="flex items-center space-x-2">
        <div className="bg-gray-600 px-3 py-2 rounded text-white font-mono text-lg tracking-wider">
          {captchaCode}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateCaptcha}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter code above"
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          maxLength={5}
        />
        <Button
          type="button"
          onClick={handleVerify}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Verify
        </Button>
      </div>
      {isVerified && (
        <p className="text-sm text-green-400">✓ Verification successful</p>
      )}
      {userInput && !isVerified && userInput.length === 5 && (
        <p className="text-sm text-red-400">✗ Code doesn't match</p>
      )}
    </div>
  )
}