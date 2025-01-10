import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeName = (name: string) => {
  const parts = name.split(/[^\w\s.$]+/);
  return parts[0].trim();
};
