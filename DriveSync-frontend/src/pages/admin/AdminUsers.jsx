import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Ban, CheckCircle2, RefreshCw, Search, ShieldCheck, Users, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EmptyState, Spinner } from '../../components/ui/States';
import apiClient from '../../api/apiClient';
import { getErrorMessage } from '../../api/httpClient';
import { API_BASE_URL } from '../../config/appConfig';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [onlyPendingDocs, setOnlyPendingDocs] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await apiClient.get('/auth/admin/users', { params });
      setUsers(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, role) => {
    try {
      await apiClient.patch(`/auth/admin/users/${userId}/role`, { role });
      toast.success(`Role updated to ${role}`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleActive = async (u) => {
    const nextActive = u.isActive === false;
    try {
      await apiClient.patch(`/auth/admin/users/${u._id}/status`, { isActive: nextActive });
      toast.success(`Account ${nextActive ? 'activated' : 'suspended'}`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleVerifyDoc = async (userId, approve) => {
    let rejectionReason = '';
    if (!approve) {
      rejectionReason = window.prompt('Enter rejection reason (optional):', 'Document is unclear or expired') || '';
    }
    try {
      await apiClient.patch(`/auth/admin/users/${userId}/verify`, {
        isVerified: approve,
        rejectionReason,
      });
      toast.success(`Driving license ${approve ? 'verified' : 'rejected'}`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const displayedUsers = onlyPendingDocs
    ? users.filter((u) => u.documentStatus === 'Pending')
    : users;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management & License Verification"
        subtitle="Manage customer and staff accounts, assign roles, and verify driving licenses."
        actions={
          <Button variant="secondary" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl bg-ds-surface px-3.5 py-2"
        >
          <Search className="h-4 w-4 text-ds-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
          <Button type="submit" size="sm">Search</Button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm font-medium text-ds-ink outline-none"
        >
          <option value="">All Roles</option>
          <option value="Customer">Customer</option>
          <option value="Fleet Manager">Fleet Manager</option>
          <option value="Admin">Admin</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyPendingDocs}
            onChange={(e) => setOnlyPendingDocs(e.target.checked)}
            className="h-4 w-4 rounded text-amber-600"
          />
          Pending License Reviews Only
        </label>
      </Card>

      {loading ? (
        <Card className="p-10 flex justify-center">
          <Spinner label="Loading users..." />
        </Card>
      ) : displayedUsers.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search or filter settings."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ds-surface text-xs font-bold uppercase tracking-wider text-ds-muted">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">License Verification</th>
                  <th className="px-5 py-3.5">Account</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedUsers.map((u) => {
                  const docStatus = u.documentStatus || (u.isVerified ? 'Verified' : 'Not Submitted');
                  const docUrl = u.drivingLicenseUrl
                    ? u.drivingLicenseUrl.startsWith('http')
                      ? u.drivingLicenseUrl
                      : `${API_BASE_URL}/api/auth${u.drivingLicenseUrl}`
                    : null;
                  const active = u.isActive !== false;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-ds-ink">{u.name}</p>
                        <p className="text-xs text-ds-muted">{u.email}</p>
                        {u.phone && <p className="text-[11px] text-ds-muted">{u.phone}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-ds-ink outline-none"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Fleet Manager">Fleet Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-xs space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                            docStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : docStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : docStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {docStatus}
                        </span>
                        {u.licenseNumber && <p className="text-[11px] text-ds-muted">No: {u.licenseNumber}</p>}
                        {docUrl && (
                          <a href={docUrl} target="_blank" rel="noreferrer" className="block text-[11px] font-bold text-ds-link hover:underline">
                            View License &rarr;
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {docStatus === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleVerifyDoc(u._id, true)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                title="Approve License"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVerifyDoc(u._id, false)}
                                className="text-rose-600 hover:bg-rose-50"
                                title="Reject License"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleActive(u)}
                            title={active ? 'Suspend Account' : 'Activate Account'}
                          >
                            {active ? <Ban className="h-3.5 w-3.5 text-rose-600" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                            {active ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
