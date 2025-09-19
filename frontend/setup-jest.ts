import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Mock the assetManager from pubg-ts
jest.mock('@j03fr0st/pubg-ts', () => ({
  assetManager: {
    getDamageCauserName: jest.fn((id: string) => id),
    getItemName: jest.fn((id: string) => id),
    getVehicleName: jest.fn((id: string) => id),
    getGameModeName: jest.fn((id: string) => id),
    getMapName: jest.fn((id: string) => id),
  },
}));

// Mock environment variables
global.fetch = jest.fn();

// Setup global test helpers
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => '',
  }),
});