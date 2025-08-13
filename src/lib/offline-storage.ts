// Offline storage utilities for Kisan Sathi
// Handles offline data storage and synchronization

interface OfflineData {
  id: string;
  type: 'crop-analysis' | 'weather-data' | 'market-prices' | 'voice-query';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorage {
  private dbName = 'KisanSathiDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('cached_responses')) {
          const cacheStore = db.createObjectStore('cached_responses', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveOfflineData(type: OfflineData['type'], data: any): Promise<string> {
    if (!this.db) await this.init();

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const request = store.add(offlineData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(type?: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readonly');
      const store = transaction.objectStore('offline_data');
      
      let request: IDBRequest;
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_data'], 'readwrite');
      const store = transaction.objectStore('offline_data');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cacheResponse(key: string, response: any, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cachedData = {
      key,
      response,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_responses'], 'readwrite');
      const store = transaction.objectStore('cached_responses');
      const request = store.put(cachedData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedResponse(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_responses'], 'readonly');
      const store = transaction.objectStore('cached_responses');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expires > Date.now()) {
          resolve(result.response);
        } else {
          // Clean up expired cache
          if (result) {
            const deleteTransaction = this.db!.transaction(['cached_responses'], 'readwrite');
            const deleteStore = deleteTransaction.objectStore('cached_responses');
            deleteStore.delete(key);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached_responses'], 'readwrite');
      const store = transaction.objectStore('cached_responses');
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value;
          if (data.expires < Date.now()) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async syncPendingData(): Promise<void> {
    const pendingData = await this.getOfflineData();
    const unsyncedData = pendingData.filter(item => !item.synced);

    for (const item of unsyncedData) {
      try {
        await this.syncDataItem(item);
        await this.markAsSynced(item.id);
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
      }
    }
  }

  private async syncDataItem(item: OfflineData): Promise<void> {
    // This would typically send data to your backend
    // For now, we'll just simulate the sync
    console.log('Syncing offline data:', item);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // 1. Send the data to your backend API
    // 2. Handle any conflicts or errors
    // 3. Update local state if needed
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Utility functions for common operations
export const saveOfflineCropAnalysis = async (analysisData: any) => {
  return offlineStorage.saveOfflineData('crop-analysis', analysisData);
};

export const saveOfflineWeatherData = async (weatherData: any) => {
  return offlineStorage.saveOfflineData('weather-data', weatherData);
};

export const saveOfflineVoiceQuery = async (queryData: any) => {
  return offlineStorage.saveOfflineData('voice-query', queryData);
};

export const getCachedMarketPrices = async () => {
  return offlineStorage.getCachedResponse('market-prices');
};

export const cacheMarketPrices = async (prices: any) => {
  return offlineStorage.cacheResponse('market-prices', prices, 2 * 60 * 60 * 1000); // 2 hours
};

// Initialize offline storage when module loads
offlineStorage.init().catch(console.error);