import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count: number
  className?: string
  max?: number
}

export function NotificationBadge({ count, className, max = 99 }: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-medium px-1",
        className,
      )}
    >
      {displayCount}
    </span>
  )
}
