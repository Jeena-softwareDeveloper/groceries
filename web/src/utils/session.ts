const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const DISTRICT_KEY = 'districtId';
const AREA_KEY = 'areaId';
const DISTRICT_NAME_KEY = 'districtName';
const AREA_NAME_KEY = 'areaName';

export const sessionManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getDistrictId: () => localStorage.getItem(DISTRICT_KEY),
  getAreaId: () => localStorage.getItem(AREA_KEY),
  getDistrictName: () => localStorage.getItem(DISTRICT_NAME_KEY),
  getAreaName: () => localStorage.getItem(AREA_NAME_KEY),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  
  setLocation: (districtId: string, areaId?: string, districtName?: string, areaName?: string) => {
    localStorage.setItem(DISTRICT_KEY, districtId);
    if (areaId) localStorage.setItem(AREA_KEY, areaId);
    else localStorage.removeItem(AREA_KEY);
    
    if (districtName) localStorage.setItem(DISTRICT_NAME_KEY, districtName);
    if (areaName) localStorage.setItem(AREA_NAME_KEY, areaName);
  },
  
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  
  clearLocation: () => {
    localStorage.removeItem(DISTRICT_KEY);
    localStorage.removeItem(AREA_KEY);
    localStorage.removeItem(DISTRICT_NAME_KEY);
    localStorage.removeItem(AREA_NAME_KEY);
  }
};
