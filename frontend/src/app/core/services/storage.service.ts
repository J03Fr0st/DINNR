import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'dinnr_';

  set<T>(key: string, value: T, ttl?: number): void {
    const fullKey = this.PREFIX + key;
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || null
    };
    
    try {
      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.clearExpired();
      try {
        localStorage.setItem(fullKey, JSON.stringify(item));
      } catch (error) {
        console.error('Still unable to save to localStorage after cleanup:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    const fullKey = this.PREFIX + key;
    try {
      const item = localStorage.getItem(fullKey);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      if (this.isExpired(parsed)) {
        localStorage.removeItem(fullKey);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    const fullKey = this.PREFIX + key;
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from localStorage:', error);
      }
    });
  }

  clearExpired(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed)) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing expired item from localStorage:', error);
      }
    });
  }

  getStats(): { total: number; expired: number; size: string } {
    let total = 0;
    let expired = 0;
    let size = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        total++;
        size += key.length + (localStorage.getItem(key)?.length || 0);
        
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed)) {
              expired++;
            }
          }
        } catch (error) {
          expired++;
        }
      }
    }

    return {
      total,
      expired,
      size: this.formatBytes(size)
    };
  }

  private isExpired(item: any): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}