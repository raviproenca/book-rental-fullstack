import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Up to two uppercase initials from a display name (matches profile avatar in app). */
export function nameInitials(nome: string | null | undefined): string {
  const t = nome?.trim();
  if (!t) return "?";
  return t
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
