import { useEffect, useState } from "react";

export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储不可用时保持页面可操作；刷新持久化依赖浏览器恢复存储能力。
  }
}

// 用于框架配置类数据：用户在页面上的增删改和排序都应长期保留。
export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorageValue(key, fallback));

  useEffect(() => {
    writeStorageValue(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
