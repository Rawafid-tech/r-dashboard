const GOOGLE_MAPS_SCRIPT_ID = "rawafid-google-maps-js";

let googleMapsLoadPromise: Promise<typeof google.maps> | null = null;

function getGoogleMaps(): typeof google.maps | null {
  return typeof google !== "undefined" ? google.maps : null;
}

export function isGoogleMapsConfigured(apiKey: string): boolean {
  return apiKey.trim().length > 0;
}

export function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  const existing = getGoogleMaps();
  if (existing) {
    return Promise.resolve(existing);
  }

  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  if (!isGoogleMapsConfigured(apiKey)) {
    return Promise.reject(new Error("Google Maps API key is not configured"));
  }

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const prior = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (prior) {
      prior.addEventListener("load", () => {
        const maps = getGoogleMaps();
        if (maps) resolve(maps);
        else reject(new Error("Google Maps failed to initialize"));
      });
      prior.addEventListener("error", () => {
        reject(new Error("Google Maps script failed to load"));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => {
      const maps = getGoogleMaps();
      if (maps) resolve(maps);
      else reject(new Error("Google Maps failed to initialize"));
    };
    script.onerror = () => {
      googleMapsLoadPromise = null;
      reject(new Error("Google Maps script failed to load"));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export function roundCoordinate(value: number): number {
  return Number(value.toFixed(6));
}

export const DEFAULT_MAP_CENTER = {
  lat: 30.0444,
  lng: 31.2357,
} as const;

export function parseCoordinateInput(value: string | undefined): number | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
