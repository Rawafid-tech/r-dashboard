export interface CarrierCapabilities {
  labels: boolean;
  cancel: boolean;
  tracking: boolean;
  returns: boolean;
  exchanges: boolean;
  refunds: boolean;
}

export const DEFAULT_CARRIER_CAPABILITIES: CarrierCapabilities = {
  labels: true,
  cancel: true,
  tracking: true,
  returns: true,
  exchanges: true,
  refunds: true,
};

export function normalizeCarrierCapabilities(
  value: Partial<CarrierCapabilities> | null | undefined,
): CarrierCapabilities {
  if (!value) {
    return { ...DEFAULT_CARRIER_CAPABILITIES };
  }

  return {
    labels: value.labels ?? DEFAULT_CARRIER_CAPABILITIES.labels,
    cancel: value.cancel ?? DEFAULT_CARRIER_CAPABILITIES.cancel,
    tracking: value.tracking ?? DEFAULT_CARRIER_CAPABILITIES.tracking,
    returns: value.returns ?? DEFAULT_CARRIER_CAPABILITIES.returns,
    exchanges: value.exchanges ?? DEFAULT_CARRIER_CAPABILITIES.exchanges,
    refunds: value.refunds ?? DEFAULT_CARRIER_CAPABILITIES.refunds,
  };
}

export function connectionSupportsLabels(
  capabilities: Partial<CarrierCapabilities> | null | undefined,
): boolean {
  return normalizeCarrierCapabilities(capabilities).labels;
}

export function connectionSupportsCancel(
  capabilities: Partial<CarrierCapabilities> | null | undefined,
): boolean {
  return normalizeCarrierCapabilities(capabilities).cancel;
}

export function connectionSupportsRefunds(
  capabilities: Partial<CarrierCapabilities> | null | undefined,
): boolean {
  return normalizeCarrierCapabilities(capabilities).refunds;
}
