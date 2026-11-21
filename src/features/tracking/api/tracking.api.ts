import axios from "axios";
import type { PublicTracking } from "@/features/tracking/types";
import { API_BASE_URL } from "@/shared/lib/constants";

/**
 * The customer-facing tracking data. Deliberately NOT through `apiClient`: that client attaches the
 * signed-in merchant's token and refreshes it, and this page must stay anonymous (a merchant opening
 * a customer link must not send their token, and a customer has none).
 */
export async function getPublicTracking(
  code: string,
  locale: string,
  signal?: AbortSignal,
): Promise<PublicTracking> {
  const { data } = await axios.get<PublicTracking>(
    `${API_BASE_URL}/api/public/track/${encodeURIComponent(code)}`,
    { headers: { Accept: "application/json", "Accept-Language": locale }, signal, timeout: 15_000 },
  );
  return data;
}
