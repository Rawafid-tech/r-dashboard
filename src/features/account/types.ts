import type { Theme, FontScale, DateFormat } from "@/shared/types/enums";

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
}

export interface UserSettings {
  theme: Theme;
  fontScale: FontScale;
  defaultHomePage: string;
  timezone: string;
  dateFormat: DateFormat;
  mapLat: number | null;
  mapLng: number | null;
  country: string;
  currency: string;
}

export interface UpdateSettingsRequest {
  theme: Theme;
  fontScale: FontScale;
  defaultHomePage: string;
  timezone: string;
  dateFormat: DateFormat;
  mapLat?: number | null;
  mapLng?: number | null;
}
