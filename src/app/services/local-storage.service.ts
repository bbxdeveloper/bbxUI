import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() { }

  public get<TStorage>(key: string): TStorage | undefined {
      const json = localStorage.getItem(key)

      return json
        ? JSON.parse(json) as TStorage
        : undefined
  }

  public put<TStorage>(key: string, value: TStorage): void {
      const json = JSON.stringify(value)

      localStorage.setItem(key, json)
  }

  public remove(key: string): void {
    localStorage.removeItem(key)
  }

  public has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}
