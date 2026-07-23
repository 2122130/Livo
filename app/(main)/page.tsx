import Link from 'next/link'
import { MAIN_MENU } from '@/constants/menu'
import { Card, CardContent } from '@/components/ui/card'

export default function MainMenuPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">メニュー</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MAIN_MENU.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.screenId} href={item.href}>
              <Card className="transition-colors hover:bg-accent hover:border-primary/40">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}