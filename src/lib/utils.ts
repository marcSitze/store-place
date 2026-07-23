import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | undefined | null) {
  if (price === undefined || price === null) return "$0.00";
  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(numericPrice)) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
}
