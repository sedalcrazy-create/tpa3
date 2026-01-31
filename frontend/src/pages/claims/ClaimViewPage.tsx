import { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  ArrowRightIcon,
  PaperClipIcon,
  TrashIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

import { claimsApi } from '../../api/claims';
import { formatDate, formatCurrency } from '../../utils/format';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import type { Claim, ClaimNote, ClaimAttachment, ClaimInvoice } from '../../types/claim';

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-40 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value || '-'}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status workflow step
// ---------------------------------------------------------------------------
interface StatusStepProps {
  label: string;
  state: 'completed' | 'current' | 'future';
  isLast: boolean;
}

function StatusStep({ label, state, isLast }: StatusStepProps) {
  const circleClass =
    state === 'current'
      ? 'bg-primary text-white border-primary'
      : state === 'completed'
        ? 'bg-green-500 text-white border-green-500'
        : 'bg-gray-200 text-gray-400 border-gray-300';

  const lineClass =
    state === 'completed' ? 'bg-green-500' : state === 'current' ? 'bg-primary' : 'bg-gray-300';

  const labelClass =
    state === 'current'
      ? 'text-primary font-bold'
      : state === 'completed'
        ? 'text-green-700 font-medium'
        : 'text-gray-400';

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${circleClass}`}
        >
          {state === 'completed' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-current" />
          )}
        </div>
        <span className={`mt-1.5 text-xs whitespace-nowrap ${labelClass}`}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className={`h-0.5 w-12 md:w-20 mt-[-14px] ${lineClass}`} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
type TabKey = 'notes' | 'attachments' | 'invoices' | 'employee';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'notes', label: 'یادداشت‌ها' },
  { key: 'attachments', label: 'پیوست‌ها' },
  { key: 'invoices', label: 'صورتحساب‌ها' },
  { key: 'employee', label: 'اطلاعات بیمه‌شده' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ClaimViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericId = Number(id);

  // ---- Local state --------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabKey>('notes');
  const [transitionModal, setTransitionModal] = useState<string | null>(null);
  const [transitionNote, setTransitionNote] = useState('');
  const [noteText, setNoteText] = useState('');
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Fetch claim data ---------------------------------------------------
  const {
    data: claim,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['claim', numericId],
    queryFn: () => claimsApi.get(numericId),
    enabled: !!numericId,
  });

  // ---- Transition mutation ------------------------------------------------
  const transitionMutation = useMutation({
    mutationFn: (data: { status: string; note?: string }) =>
      claimsApi.transition(numericId, data),
    onSuccess: () => {
      toast.success('وضعیت پرونده با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['claim', numericId] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setTransitionModal(null);
      setTransitionNote('');
    },
    onError: () => {
      toast.error('خطا در تغییر وضعیت پرونده');
    },
  });

  // ---- Add note mutation --------------------------------------------------
  const addNoteMutation = useMutation({
    mutationFn: (data: { note: string }) => claimsApi.addNote(numericId, data),
    onSuccess: () => {
      toast.success('یادداشت با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['claim', numericId] });
      setNoteText('');
    },
    onError: () => {
      toast.error('خطا در ثبت یادداشت');
    },
  });

  // ---- Upload attachment mutation -----------------------------------------
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => claimsApi.addAttachment(numericId, formData),
    onSuccess: () => {
      toast.success('فایل با موفقیت بارگذاری شد');
      queryClient.invalidateQueries({ queryKey: ['claim', numericId] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => {
      toast.error('خطا در بارگذاری فایل');
    },
  });

  // ---- Delete attachment mutation -----------------------------------------
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) =>
      claimsApi.deleteAttachment(numericId, attachmentId),
    onSuccess: () => {
      toast.success('فایل با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['claim', numericId] });
      setDeleteAttachmentId(null);
    },
    onError: () => {
      toast.error('خطا در حذف فایل');
    },
  });

  // ---- Handlers -----------------------------------------------------------
  const handleTransitionSubmit = () => {
    if (!transitionModal) return;
    transitionMutation.mutate({
      status: transitionModal,
      note: transitionNote || undefined,
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNoteMutation.mutate({ note: noteText.trim() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ---- Loading / Error states ---------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !claim) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">پرونده خسارت مورد نظر یافت نشد.</p>
        <Button variant="secondary" onClick={() => navigate('/claims')}>
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  // ---- Derived data -------------------------------------------------------
  const notes: ClaimNote[] = claim.notes || [];
  const attachments: ClaimAttachment[] = claim.attachments || [];
  const invoices: ClaimInvoice[] = claim.invoices || [];
  const nextStatuses: string[] = claim.next_statuses || [];

  // Build status steps for the workflow visualization
  // We use the status constants as the ordered flow
  const ALL_STATUSES = [
    'draft',
    'pending',
    'processing',
    'approved',
    'rejected',
    'completed',
    'cancelled',
    'paid',
  ];

  const currentIndex = ALL_STATUSES.indexOf(claim.status);

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* Header                                                            */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">جزئیات پرونده خسارت</h1>
        <div className="flex items-center gap-2">
          <Link to={`/claims/${numericId}/edit`}>
            <Button variant="secondary" size="sm" icon={<PencilIcon className="w-4 h-4" />}>
              ویرایش
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightIcon className="w-4 h-4" />}
            onClick={() => navigate('/claims')}
          >
            بازگشت
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Claim details card                                                */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">اطلاعات پرونده</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <DetailRow label="شماره پرونده" value={claim.claim_number} />
          <DetailRow label="نام بیمه‌شده" value={claim.employee_name} />
          <DetailRow label="مرکز درمانی" value={claim.center_name} />
          <DetailRow label="نوع خسارت" value={claim.claim_type_title} />
          <DetailRow label="تاریخ خسارت" value={formatDate(claim.claim_date)} />
          <DetailRow
            label="وضعیت"
            value={
              <StatusBadge
                status={claim.status}
                label={claim.status_title}
              />
            }
          />
          <DetailRow label="مبلغ کل" value={formatCurrency(claim.total_amount ?? 0)} />
          <DetailRow label="مبلغ تایید شده" value={formatCurrency(claim.approved_amount ?? 0)} />
          <DetailRow label="سهم بیمار" value={formatCurrency(claim.patient_share ?? 0)} />
          <DetailRow label="سهم بیمه" value={formatCurrency(claim.insurance_share ?? 0)} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* Status workflow visualization                                     */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-5">مراحل پرونده</h2>
        <div className="flex items-start justify-center overflow-x-auto pb-2">
          {ALL_STATUSES.map((status, idx) => {
            let state: 'completed' | 'current' | 'future';
            if (idx < currentIndex) {
              state = 'completed';
            } else if (idx === currentIndex) {
              state = 'current';
            } else {
              state = 'future';
            }
            return (
              <StatusStep
                key={status}
                label={STATUS_LABELS[status] || status}
                state={state}
                isLast={idx === ALL_STATUSES.length - 1}
              />
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Transition buttons                                                */}
      {/* ================================================================= */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">تغییر وضعیت</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {nextStatuses.map((status) => {
              const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
              return (
                <button
                  key={status}
                  onClick={() => setTransitionModal(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80 ${colorClass}`}
                >
                  {STATUS_LABELS[status] || status}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Tabs                                                              */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tab headers */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* ----- Notes Tab ------------------------------------------------ */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add note form */}
              <div className="flex gap-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={2}
                  placeholder="یادداشت جدید را وارد کنید..."
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  loading={addNoteMutation.isPending}
                  disabled={!noteText.trim()}
                  icon={<ChatBubbleLeftEllipsisIcon className="w-4 h-4" />}
                >
                  ثبت
                </Button>
              </div>

              {/* Notes timeline */}
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  یادداشتی ثبت نشده است.
                </p>
              ) : (
                <div className="space-y-0">
                  {notes.map((note, index) => (
                    <div
                      key={note.id}
                      className={`relative flex gap-4 pb-6 ${
                        index < notes.length - 1 ? '' : ''
                      }`}
                    >
                      {/* Timeline line */}
                      {index < notes.length - 1 && (
                        <div className="absolute start-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {note.user_name || 'کاربر'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {note.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----- Attachments Tab ------------------------------------------ */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {/* Upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  icon={<CloudArrowUpIcon className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadMutation.isPending}
                >
                  بارگذاری فایل
                </Button>
              </div>

              {/* Attachments list */}
              {attachments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  پیوستی بارگذاری نشده است.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-10">
                          ردیف
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">
                          نام فایل
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-28">
                          نوع فایل
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-28">
                          حجم
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">
                          بارگذاری توسط
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-32">
                          تاریخ
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 w-20">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attachments.map((att, index) => (
                        <tr
                          key={att.id}
                          className={`border-b border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-3 py-2.5 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2.5 text-gray-700">
                            <div className="flex items-center gap-2">
                              <PaperClipIcon className="w-4 h-4 text-gray-400 shrink-0" />
                              <a
                                href={att.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {att.file_name}
                              </a>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">{att.file_type}</td>
                          <td className="px-3 py-2.5 text-gray-500">
                            {formatFileSize(att.file_size)}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {att.uploaded_by || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">
                            {formatDate(att.created_at)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              onClick={() => setDeleteAttachmentId(att.id)}
                              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-danger transition-colors"
                              title="حذف"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----- Invoices Tab --------------------------------------------- */}
          {activeTab === 'invoices' && (
            <div>
              {invoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  صورتحسابی ثبت نشده است.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600 w-10">
                          ردیف
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">
                          شماره صورتحساب
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">
                          مبلغ کل
                        </th>
                        <th className="px-3 py-2.5 text-start text-xs font-semibold text-gray-600">
                          مبلغ تایید شده
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, index) => (
                        <tr
                          key={inv.id}
                          className={`border-b border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-3 py-2.5 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {inv.invoice_number || '-'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {formatCurrency(inv.total_amount)}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {formatCurrency(inv.approved_amount ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----- Employee Info Tab ---------------------------------------- */}
          {activeTab === 'employee' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <DetailRow label="شناسه بیمه‌شده" value={claim.employee_id} />
              <DetailRow label="نام بیمه‌شده" value={claim.employee_name} />
              <DetailRow label="شناسه بیمه‌نامه" value={claim.insurance_id} />
              <DetailRow label="مرکز درمانی" value={claim.center_name} />
              <DetailRow label="نوع خسارت" value={claim.claim_type_title} />
              {claim.description && (
                <div className="md:col-span-2">
                  <DetailRow label="توضیحات" value={claim.description} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* Transition modal                                                  */}
      {/* ================================================================= */}
      <Modal
        open={transitionModal !== null}
        onClose={() => {
          setTransitionModal(null);
          setTransitionNote('');
        }}
        title={`تغییر وضعیت به: ${transitionModal ? STATUS_LABELS[transitionModal] || transitionModal : ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            آیا از تغییر وضعیت پرونده اطمینان دارید؟ در صورت تمایل می‌توانید یادداشتی اضافه کنید.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              یادداشت (اختیاری)
            </label>
            <textarea
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              rows={3}
              placeholder="توضیحات تغییر وضعیت..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTransitionModal(null);
                setTransitionNote('');
              }}
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handleTransitionSubmit}
              loading={transitionMutation.isPending}
            >
              تایید تغییر وضعیت
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* Delete attachment confirm dialog                                  */}
      {/* ================================================================= */}
      <ConfirmDialog
        open={deleteAttachmentId !== null}
        onClose={() => setDeleteAttachmentId(null)}
        onConfirm={() =>
          deleteAttachmentId !== null &&
          deleteAttachmentMutation.mutate(deleteAttachmentId)
        }
        title="تایید حذف پیوست"
        message="آیا از حذف این فایل پیوست اطمینان دارید؟"
        confirmLabel="حذف"
        loading={deleteAttachmentMutation.isPending}
      />
    </div>
  );
}
