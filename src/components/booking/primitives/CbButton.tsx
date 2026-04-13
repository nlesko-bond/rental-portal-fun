"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type CbButtonVariant = "primary" | "ghost" | "dangerGhost";

const variantClass: Record<CbButtonVariant, string> = {
  primary: "cb-btn-primary",
  ghost: "cb-btn-ghost",
  dangerGhost: "cb-btn-ghost text-[var(--cb-error-text)]",
};

type CbButtonProps = {
  variant?: CbButtonVariant;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function CbButton({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...rest
}: CbButtonProps) {
  const cls = `${variantClass[variant]} ${className}`.trim();
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
