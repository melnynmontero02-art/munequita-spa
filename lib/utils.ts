import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
