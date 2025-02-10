import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UnexposedData<T, K extends keyof T> = Omit<T, K>;

export const unexposeSensitiveData = <T extends object, K extends keyof T>(
  shape: T,
  hide: K[],
): UnexposedData<T, K> => {
  const parsedObj = { ...shape };
  Object.keys(parsedObj).forEach((k) => {
    if (hide.includes(k as K)) delete parsedObj[k as K];
  });
  return parsedObj as UnexposedData<T, K>;
};
