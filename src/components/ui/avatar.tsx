"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "size-9 rounded-full relative flex shrink-0 select-none items-center justify-center overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-primary/20 text-primary rounded-full flex size-full items-center justify-center text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };
