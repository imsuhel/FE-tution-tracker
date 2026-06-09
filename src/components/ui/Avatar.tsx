import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-medium text-neutral-200 capitalize",
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar };
