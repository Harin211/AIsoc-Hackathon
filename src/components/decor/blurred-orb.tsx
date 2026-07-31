import { cn } from "@/lib/utils";

export default function BlurredOrb({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-16 h-16 bg-gradient-to-b from-primary to-accent rounded-full blur-3xl",
        className,
      )}
      style={style}
    />
  );
}
