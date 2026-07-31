import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
