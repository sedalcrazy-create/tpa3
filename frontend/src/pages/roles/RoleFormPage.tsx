import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import FormField from '../../components/ui/FormField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

import { rolesApi } from '../../api/roles';
import type { Permission } from '../../api/roles';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function RoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const numericId = Number(id);

  // ---- Form state ---------------------------------------------------------
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());

  // ---- Validation errors --------------------------------------------------
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Fetch existing role (edit mode) ------------------------------------
  const {
    data: role,
    isLoading: roleLoading,
    isError: roleError,
  } = useQuery({
    queryKey: ['role', numericId],
    queryFn: () => rolesApi.get(numericId),
    enabled: isEditing && !!numericId,
  });

  // ---- Fetch all permissions ----------------------------------------------
  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.permissions(),
  });

  // ---- Group permissions by group_name ------------------------------------
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return new Map<string, Permission[]>();
    const map = new Map<string, Permission[]>();
    for (const perm of allPermissions) {
      const group = perm.group_name || '\u0633\u0627\u06CC\u0631';
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(perm);
    }
    return map;
  }, [allPermissions]);

  // ---- Pre-fill form when data loads (edit mode) --------------------------
  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setTitle(role.title || '');
      setDescription(role.description || '');
      setIsActive(role.is_active ?? true);
      if (role.permissions) {
        setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)));
      }
    }
  }, [role]);

  // ---- Permission toggle helpers ------------------------------------------
  const togglePermission = (permId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleGroupAll = (groupPerms: Permission[]) => {
    const allIds = groupPerms.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedPermissionIds.has(id));

    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const isGroupAllSelected = (groupPerms: Permission[]) => {
    return groupPerms.length > 0 && groupPerms.every((p) => selectedPermissionIds.has(p.id));
  };

  const isGroupPartiallySelected = (groupPerms: Permission[]) => {
    const someSelected = groupPerms.some((p) => selectedPermissionIds.has(p.id));
    const allSelected = groupPerms.every((p) => selectedPermissionIds.has(p.id));
    return someSelected && !allSelected;
  };

  // ---- Validation ---------------------------------------------------------
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = '\u0646\u0627\u0645 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A';
    }
    if (!title.trim()) {
      newErrors.title = '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Mutations ----------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof rolesApi.create>[0]) => rolesApi.create(data),
    onSuccess: () => {
      toast.success('\u0646\u0642\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u06CC\u062C\u0627\u062F \u0634\u062F');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
    onError: () => {
      toast.error('\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0646\u0642\u0634');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof rolesApi.update>[1]) => rolesApi.update(numericId, data),
    onSuccess: () => {
      toast.success('\u0646\u0642\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0634\u062F');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', numericId] });
      navigate('/roles');
    },
    onError: () => {
      toast.error('\u062E\u0637\u0627 \u062F\u0631 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u0642\u0634');
    },
  });

  // ---- Submit handler -----------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      is_active: isActive,
      permission_ids: Array.from(selectedPermissionIds),
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---- Loading / Error states (edit mode) ---------------------------------
  if (isEditing && roleLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && (roleError || !role)) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 mb-4">
          \u0646\u0642\u0634 \u0645\u0648\u0631\u062F \u0646\u0638\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F.
        </p>
        <Button variant="secondary" onClick={() => navigate('/roles')}>
          \u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0644\u06CC\u0633\u062A
        </Button>
      </div>
    );
  }

  // ---- Input class --------------------------------------------------------
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary';

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {isEditing
            ? '\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u0642\u0634'
            : '\u0627\u06CC\u062C\u0627\u062F \u0646\u0642\u0634'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u067E\u0627\u06CC\u0647
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* name (English) */}
            <FormField
              label="\u0646\u0627\u0645 (\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC)"
              required
              error={errors.name}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="admin"
                dir="ltr"
              />
            </FormField>

            {/* title (Persian) */}
            <FormField
              label="\u0639\u0646\u0648\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC"
              required
              error={errors.title}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="\u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645"
              />
            </FormField>

            {/* description */}
            <FormField label="\u062A\u0648\u0636\u06CC\u062D\u0627\u062A">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="\u062A\u0648\u0636\u06CC\u062D \u062F\u0631\u0628\u0627\u0631\u0647 \u0627\u06CC\u0646 \u0646\u0642\u0634..."
              />
            </FormField>

            {/* is_active */}
            <FormField label="\u0641\u0639\u0627\u0644">
              <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  \u0646\u0642\u0634 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A
                </span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0647\u0627
            </h2>
            <span className="text-xs text-gray-500">
              {selectedPermissionIds.size} \u062F\u0633\u062A\u0631\u0633\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647
            </span>
          </div>

          {permissionsLoading ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : groupedPermissions.size === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              \u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u0627\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F
            </p>
          ) : (
            <div className="space-y-4">
              {Array.from(groupedPermissions.entries()).map(([groupName, perms]) => (
                <div
                  key={groupName}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Group header with select-all */}
                  <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={isGroupAllSelected(perms)}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isGroupPartiallySelected(perms);
                        }
                      }}
                      onChange={() => toggleGroupAll(perms)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-gray-700">{groupName}</span>
                    <span className="text-xs text-gray-400">
                      ({perms.filter((p) => selectedPermissionIds.has(p.id)).length}/{perms.length})
                    </span>
                  </div>

                  {/* Permission checkboxes */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissionIds.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {perm.title}
                        </span>
                        <span className="text-xs text-gray-400 font-mono" dir="ltr">
                          ({perm.name})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSaving}>
            \u0630\u062E\u06CC\u0631\u0647
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
            \u0627\u0646\u0635\u0631\u0627\u0641
          </Button>
        </div>
      </form>
    </div>
  );
}
