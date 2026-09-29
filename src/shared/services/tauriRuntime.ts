import { invoke, isTauri, type InvokeArgs } from '@tauri-apps/api/core';

export function isNativeRuntime(): boolean {
  return isTauri();
}

export async function invokeNative<T>(command: string, args?: InvokeArgs, browserFallback?: () => T | Promise<T>): Promise<T> {
  if (isNativeRuntime()) return invoke<T>(command, args);
  if (browserFallback) return browserFallback();
  return undefined as T;
}
