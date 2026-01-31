import { useQuery } from '@tanstack/react-query';
import {
  lookupsApi,
  STATIC_GENDERS,
  STATIC_EMPLOYEE_STATUSES,
  STATIC_INSURANCE_TYPES,
  STATIC_CLAIM_STATUSES,
  STATIC_CLAIM_TYPES,
  STATIC_CENTER_TYPES,
} from '../api/lookups';
import type { SelectOption } from '../types/api';
import type { LookupItem } from '../types/common';

function toOptions(items: LookupItem[]): SelectOption[] {
  return items.map((i) => ({ value: i.id, label: i.title }));
}

function toStaticOptions(items: { value: string; label: string }[]): SelectOption[] {
  return items.map((i) => ({ value: i.value, label: i.label }));
}

const STALE = Infinity;

// ---------------------------------------------------------------------------
// API-backed lookup hooks
// ---------------------------------------------------------------------------

export function useProvinces() {
  return useQuery({
    queryKey: ['lookups', 'provinces'],
    queryFn: lookupsApi.provinces,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useLocations(provinceId?: number) {
  return useQuery({
    queryKey: ['lookups', 'locations', provinceId],
    queryFn: () => lookupsApi.locations(provinceId),
    staleTime: STALE,
    enabled: !!provinceId,
    select: toOptions,
  });
}

export function useRelationTypes() {
  return useQuery({
    queryKey: ['lookups', 'relation-types'],
    queryFn: lookupsApi.relationTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useGuardianshipTypes() {
  return useQuery({
    queryKey: ['lookups', 'guardianship-types'],
    queryFn: lookupsApi.guardianshipTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useSpecialEmployeeTypes() {
  return useQuery({
    queryKey: ['lookups', 'special-employee-types'],
    queryFn: lookupsApi.specialEmployeeTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useCustomEmployeeCodes() {
  return useQuery({
    queryKey: ['lookups', 'employee-codes'],
    queryFn: lookupsApi.customEmployeeCodes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useItemCategories() {
  return useQuery({
    queryKey: ['lookups', 'item-categories'],
    queryFn: lookupsApi.itemCategories,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useItemGroups() {
  return useQuery({
    queryKey: ['lookups', 'item-groups'],
    queryFn: lookupsApi.itemGroups,
    staleTime: STALE,
    select: toOptions,
  });
}

export function usePrescriptionTypes() {
  return useQuery({
    queryKey: ['lookups', 'prescription-types'],
    queryFn: lookupsApi.prescriptionTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['lookups', 'document-types'],
    queryFn: lookupsApi.documentTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useBodyPartTypes() {
  return useQuery({
    queryKey: ['lookups', 'body-part-types'],
    queryFn: lookupsApi.bodyPartTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useCommissionCaseTypes() {
  return useQuery({
    queryKey: ['lookups', 'commission-case-types'],
    queryFn: lookupsApi.commissionCaseTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useInstitutionContractTypes() {
  return useQuery({
    queryKey: ['lookups', 'institution-contract-types'],
    queryFn: lookupsApi.institutionContractTypes,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useMarriageStatuses() {
  return useQuery({
    queryKey: ['lookups', 'marriage-statuses'],
    queryFn: lookupsApi.marriageStatuses,
    staleTime: STALE,
    select: toOptions,
  });
}

export function useAllLocations() {
  return useQuery({
    queryKey: ['lookups', 'locations-all'],
    queryFn: () => lookupsApi.locations(),
    staleTime: STALE,
    select: toOptions,
  });
}

// ---------------------------------------------------------------------------
// Static data hooks (no backend endpoint)
// ---------------------------------------------------------------------------

export function useGenders() {
  return { data: toStaticOptions(STATIC_GENDERS), isLoading: false };
}

export function useEmployeeStatuses() {
  return { data: toStaticOptions(STATIC_EMPLOYEE_STATUSES), isLoading: false };
}

export function useInsuranceTypes() {
  return { data: toStaticOptions(STATIC_INSURANCE_TYPES), isLoading: false };
}

export function useClaimStatuses() {
  return { data: toStaticOptions(STATIC_CLAIM_STATUSES), isLoading: false };
}

export function useClaimTypes() {
  return { data: toStaticOptions(STATIC_CLAIM_TYPES), isLoading: false };
}

export function useCenterTypes() {
  return { data: toStaticOptions(STATIC_CENTER_TYPES), isLoading: false };
}
