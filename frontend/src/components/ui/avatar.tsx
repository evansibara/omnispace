import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/formatters";

const sizeMap = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [imgFailed, setImgFailed] = React.useState(false);

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgFailed(true)}
        className={cn("rounded-full object-cover ring-1 ring-[var(--color-border-subtle)]", sizeMap[size], className)}
      />
    );
  }

  return (
    <span
      title={name}
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--color-signal-50)] font-medium text-[var(--color-signal-600)] ring-1 ring-[var(--color-border-subtle)]",
        sizeMap[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 4,
}: {
  people: { id: string; fullName: string; avatarUrl: string | null }[];
  max?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((person) => (
        <Avatar
          key={person.id}
          name={person.fullName}
          src={person.avatarUrl}
          size="sm"
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-ink-700)] text-[10px] font-medium text-white ring-2 ring-white">
          +{overflow}
        </span>
      )}
    </div>
  );
}
