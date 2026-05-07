import { AddressStructured } from "@/lib/model/model";

export interface CreatePropertyPayload {
  // user
  name: string;
  type: string;
  address: AddressStructured;

  // NEW — fully structured address (recommended to send)
  propertyAddress?: string;
}

export interface CreateMultiplePropertiesPayload {
  properties: CreatePropertyPayload[];
}

// export interface OnboardingPropWrapper<T> extends T {

//   successCallback: () => void;
//   errorCallback: () => void;
// }

export type OnboardingPropWrapper<T> = T & {
  successCallback?: () => void;
  errorCallback?: (err: unknown) => void;
  onCloseModal?: () => void;
};

export interface CreateUnitPayload {
  properties: {
    propertyId: string;
    unitIds: string[];
    newUnitLabels: string[];
  }[];
}

// export interface
export interface Property {
  _id: string;
  id: string;
  business: string;
  type: "HOUSE" | "BUILDING" | "STATION";
  name: string; // e.g. "2333 Chestnut Street"
  code: string; // optional short code
  address: AddressStructured;
  isActive: boolean;
  meta: Record<string, string>;
  createdAt: string;
}

export type OnboardingState = {
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  onboardingCompletedAt: string | null;
  workspaceType: "BUSINESS" | "INDIVIDUAL" | null;
  counts: {
    properties: number;
    units: number;
    admins: number;
    technicians: number;
    tenants: number;
  };
};
