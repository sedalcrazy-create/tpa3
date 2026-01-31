import apiClient from './client';
import type { LookupItem } from '../types/common';

export const lookupsApi = {
  provinces: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/provinces').then((r) => r.data.data),

  locations: (provinceId?: number) =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/locations', { params: { province_id: provinceId } }).then((r) => r.data.data),

  relationTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/relation-types').then((r) => r.data.data),

  guardianshipTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/guardianship-types').then((r) => r.data.data),

  specialEmployeeTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/special-employee-types').then((r) => r.data.data),

  customEmployeeCodes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/employee-codes').then((r) => r.data.data),

  itemCategories: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/item-categories').then((r) => r.data.data),

  itemGroups: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/item-groups').then((r) => r.data.data),

  prescriptionTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/prescription-types').then((r) => r.data.data),

  documentTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/document-types').then((r) => r.data.data),

  bodyPartTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/body-part-types').then((r) => r.data.data),

  commissionCaseTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/commission-case-types').then((r) => r.data.data),

  institutionContractTypes: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/institution-contract-types').then((r) => r.data.data),

  marriageStatuses: () =>
    apiClient.get<{ data: LookupItem[] }>('/lookups/marriage-statuses').then((r) => r.data.data),
};

// Static lookups not provided by API
export const STATIC_GENDERS = [
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
];

export const STATIC_EMPLOYEE_STATUSES = [
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غیرفعال' },
  { value: 'retired', label: 'بازنشسته' },
  { value: 'suspended', label: 'معلق' },
];

export const STATIC_INSURANCE_TYPES = [
  { value: 'basic', label: 'پایه' },
  { value: 'supplementary', label: 'تکمیلی' },
];

export const STATIC_CLAIM_STATUSES = [
  { value: '1', label: 'پیش‌نویس' },
  { value: '2', label: 'ثبت شده' },
  { value: '3', label: 'در حال بررسی' },
  { value: '4', label: 'تایید شده' },
  { value: '5', label: 'رد شده' },
  { value: '6', label: 'تسویه شده' },
  { value: '7', label: 'لغو شده' },
  { value: '8', label: 'بسته شده' },
];

export const STATIC_CLAIM_TYPES = [
  { value: 'inpatient', label: 'بستری' },
  { value: 'outpatient', label: 'سرپایی' },
  { value: 'dental', label: 'دندانپزشکی' },
  { value: 'para', label: 'پاراکلینیک' },
];

export const STATIC_CENTER_TYPES = [
  { value: 'hospital', label: 'بیمارستان' },
  { value: 'clinic', label: 'کلینیک' },
  { value: 'pharmacy', label: 'داروخانه' },
  { value: 'lab', label: 'آزمایشگاه' },
  { value: 'imaging', label: 'تصویربرداری' },
  { value: 'dentistry', label: 'دندانپزشکی' },
  { value: 'physiotherapy', label: 'فیزیوتراپی' },
];
