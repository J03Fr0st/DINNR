import { TestBed } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';
import { PubgApiService } from './pubg-api.service';
import { of } from 'rxjs';

// Mock the assetManager import
jest.mock('@j03fr0st/pubg-ts', () => ({
  assetManager: {
    getDamageCauserName: jest.fn(),
    getItemName: jest.fn(),
    getVehicleName: jest.fn(),
    getGameModeName: jest.fn(),
  },
}));

import { assetManager } from '@j03fr0st/pubg-ts';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let mockPubgApiService: jest.Mocked<PubgApiService>;

  beforeEach(() => {
    mockPubgApiService = {
      getMatch: jest.fn(),
      getTelemetry: jest.fn(),
    } as unknown as jest.Mocked<PubgApiService>;

    TestBed.configureTestingModule({
      providers: [
        TelemetryService,
        { provide: PubgApiService, useValue: mockPubgApiService }
      ]
    });

    service = TestBed.inject(TelemetryService);
  });

  describe('getHumanReadableWeaponName', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    it('should return damage causer name when available and different from input', () => {
      const weaponId = 'Item_Weapon_M416_C';
      const expectedName = 'M416';

      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(expectedName);
      (assetManager.getItemName as jest.Mock).mockReturnValue(weaponId); // Won't be called
      (assetManager.getVehicleName as jest.Mock).mockReturnValue(weaponId); // Won't be called
      (assetManager.getGameModeName as jest.Mock).mockReturnValue(weaponId); // Won't be called

      // Access the private method for testing
      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(expectedName);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).not.toHaveBeenCalled();
    });

    it('should fallback to item name when damage causer name returns same as input', () => {
      const weaponId = 'Item_Weapon_AKM_C';
      const expectedName = 'AKM';

      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getItemName as jest.Mock).mockReturnValue(expectedName);
      (assetManager.getVehicleName as jest.Mock).mockReturnValue(weaponId); // Won't be called
      (assetManager.getGameModeName as jest.Mock).mockReturnValue(weaponId); // Won't be called

      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(expectedName);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getVehicleName).not.toHaveBeenCalled();
    });

    it('should fallback to vehicle name when item name returns same as input', () => {
      const weaponId = 'Vehicle_Dacia_C';
      const expectedName = 'Dacia';

      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getItemName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getVehicleName as jest.Mock).mockReturnValue(expectedName);
      (assetManager.getGameModeName as jest.Mock).mockReturnValue(weaponId); // Won't be called

      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(expectedName);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getVehicleName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getGameModeName).not.toHaveBeenCalled();
    });

    it('should fallback to game mode name when vehicle name returns same as input', () => {
      const weaponId = 'GameMode_Special_C';
      const expectedName = 'Special Mode';

      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getItemName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getVehicleName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getGameModeName as jest.Mock).mockReturnValue(expectedName);

      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(expectedName);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getVehicleName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getGameModeName).toHaveBeenCalledWith(weaponId);
    });

    it('should return original weaponId when all asset manager methods return same as input', () => {
      const weaponId = 'Unknown_Weapon_C';

      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getItemName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getVehicleName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getGameModeName as jest.Mock).mockReturnValue(weaponId); // Same as input

      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(weaponId);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getVehicleName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getGameModeName).toHaveBeenCalledWith(weaponId);
    });

    it('should handle empty or null weaponId gracefully', () => {
      const result1 = (service as any).getHumanReadableWeaponName('');
      const result2 = (service as any).getHumanReadableWeaponName(null);
      const result3 = (service as any).getHumanReadableWeaponName(undefined);

      expect(result1).toBe('');
      expect(result2).toBe(null);
      expect(result3).toBe(undefined);

      // Should not call any asset manager methods for falsy values
      expect(assetManager.getDamageCauserName).not.toHaveBeenCalled();
      expect(assetManager.getItemName).not.toHaveBeenCalled();
      expect(assetManager.getVehicleName).not.toHaveBeenCalled();
      expect(assetManager.getGameModeName).not.toHaveBeenCalled();
    });

    it('should stop checking further methods once a different name is found', () => {
      const weaponId = 'Item_Weapon_SCAR-L_C';
      const expectedName = 'SCAR-L';

      // Set up mocks so that itemName returns a different value
      (assetManager.getDamageCauserName as jest.Mock).mockReturnValue(weaponId); // Same as input
      (assetManager.getItemName as jest.Mock).mockReturnValue(expectedName); // Different from input
      (assetManager.getVehicleName as jest.Mock).mockReturnValue('ShouldNotBeCalled');
      (assetManager.getGameModeName as jest.Mock).mockReturnValue('ShouldNotBeCalled');

      const result = (service as any).getHumanReadableWeaponName(weaponId);

      expect(result).toBe(expectedName);
      expect(assetManager.getDamageCauserName).toHaveBeenCalledWith(weaponId);
      expect(assetManager.getItemName).toHaveBeenCalledWith(weaponId);
      // Should not call the remaining methods since itemName returned a different value
      expect(assetManager.getVehicleName).not.toHaveBeenCalled();
      expect(assetManager.getGameModeName).not.toHaveBeenCalled();
    });

    });

  describe('Integration test with real weapon names', () => {
    it('should handle common PUBG weapon IDs', () => {
      // Test with some real PUBG weapon IDs to see what the asset manager returns
      const commonWeapons = [
        'Item_Weapon_M416_C',
        'Item_Weapon_AKM_C',
        'Item_Weapon_Kar98k_C',
        'Item_Weapon_AWM_C',
        'Item_Weapon_SCAR-L_C',
        'Item_Weapon_M24_C',
        'Item_Weapon_VSS_C',
        'Item_Weapon_UMP45_C'
      ];

      commonWeapons.forEach(weaponId => {
        const result = (service as any).getHumanReadableWeaponName(weaponId);
        console.log(`${weaponId} -> ${result}`);

        // At minimum, it should return the original ID if nothing else works
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
