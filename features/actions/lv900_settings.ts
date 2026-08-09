'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccount } from '@/features/auth/get-my-account'
import { ROLE } from '@/constants/kbn'
import { revalidatePath } from 'next/cache'

// export async function sendPasswordReset() {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user?.email) redirect('/login')

//   const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
//     redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`,  // ← /login から変更
//   })
//   if (error) throw error

//   redirect('/settings?reset=sent')
// }

export async function createAccount(formData: FormData) {
  const me = await getMyAccount()
  if (!me) redirect('/login')

  const isSystem = me.role === ROLE.SYSTEM
  const isAdmin = me.role === ROLE.ADMIN
  if (!isSystem && !isAdmin) {
    throw new Error('アカウントを作成する権限がありません')
  }

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const inputRole = formData.get('role') as string
  const inputOrgId = formData.get('org_id') as string

  // 権限に応じて、作成できる組織・ロールを制限
  const targetOrgId = isSystem ? inputOrgId : me.org_id       // adminは自組織固定
  const targetRole = isSystem ? inputRole : ROLE.MEMBER        // adminは一般のみ

  if (isSystem && !targetOrgId) {
    throw new Error('組織を選択してください')
  }
  if (targetRole === ROLE.SYSTEM) {
    throw new Error('システム管理者はこの画面から作成できません')
  }

  const admin = createAdminClient()

  // 1. Authユーザーを招待(メールで招待リンクを送信)
  const { data: invited, error: authError } =
    await admin.auth.admin.inviteUserByEmail(email)
  if (authError) throw authError

  // 2. m110_accountに登録(上限チェックはDBトリガーが行う)
  const { error: insertError } = await admin.from('m110_account').insert({
    auth_user_id: invited.user.id,
    org_id: targetOrgId,
    name,
    role: targetRole,
    create_account: me.name,
  })
  if (insertError) {
    // アカウント作成に失敗したらAuthユーザーも削除(不整合を防ぐ)
    await admin.auth.admin.deleteUser(invited.user.id)
    throw insertError
  }

  revalidatePath('/settings/accounts')
  redirect('/settings/accounts?created=1')
}

export type PasswordFormState = { error: string | null; success: boolean }

export async function updateMyPassword(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const account = await getMyAccount()
  if (!account) redirect('/login')

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 6) {
    return { error: 'パスワードは6文字以上で入力してください', success: false }
  }
  if (password !== confirm) {
    return { error: 'パスワードが一致しません', success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: 'パスワードの更新に失敗しました', success: false }
  }

  return { error: null, success: true }
}