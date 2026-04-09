// PATH: src/components/settings/PasswordSection.tsx
'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface Props {
  lang: string
  l: Record<string, any>
  modeGradient: string
}

export default function PasswordSection({ lang, l, modeGradient }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.warning(l.passwordTooShort); return }
    if (newPassword !== confirmPassword) { toast.warning(l.passwordMismatch); return }
    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast.error(l.passwordError + ': ' + error.message)
      } else {
        toast.success(l.passwordChanged)
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(async () => {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }, 2000)
      }
    } catch (err) {
      toast.error(l.passwordError)
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Eye className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{l.changePassword}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{l.changePasswordDesc}</p>
      <div className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l.newPasswordLabel}</label>
          <div className="relative">
            <input type={showPasswords ? 'text' : 'password'} value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-24"
              placeholder="Min. 6 znaků" minLength={6} />
            <button type="button" onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              {showPasswords ? <><EyeOff className="w-3.5 h-3.5" /> {l.hidePassword}</> : <><Eye className="w-3.5 h-3.5" /> {l.showPassword}</>}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l.confirmPasswordLabel}</label>
          <input type={showPasswords ? 'text' : 'password'} value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Zopakujte nové heslo" minLength={6} />
        </div>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500">{l.passwordMismatch}</p>
        )}
        <button onClick={handleChangePassword}
          disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
          style={{ background: modeGradient }}
          className="px-4 py-2 text-white rounded-lg hover:brightness-110 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {changingPassword ? '...' : l.changePasswordBtn}
        </button>
      </div>
    </div>
  )
}
