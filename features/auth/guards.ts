import { getMyAccount } from './get-my-account'
import { ROLE } from '@/constants/kbn'

// システム管理者かどうか
export async function isSystemAdmin() {
  const account = await getMyAccount()
  return account?.role === ROLE.SYSTEM
}

// 管理者以上(admin または system)かどうか
export async function isAdminOrAbove() {
  const account = await getMyAccount()
  return account?.role === ROLE.ADMIN || account?.role === ROLE.SYSTEM
}