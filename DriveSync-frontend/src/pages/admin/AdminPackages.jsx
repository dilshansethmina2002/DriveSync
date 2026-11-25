import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Package, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EmptyState, Spinner } from '../../components/ui/States';
import apiClient from '../../api/apiClient';
import { getErrorMessage } from '../../api/httpClient';
import { formatMoney } from '../../utils/format';

const EMPTY_PKG = {
  name: '',
  category: 'Daily',
  price: '',
  discountPercent: 0,
  includedMileage: 'Unlimited',
  description: '',
  perksText: '',
  isActive: true,
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PKG);
  const [saving, setSaving] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/catalog/packages', { params: { all: true } });
      setPackages(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_PKG);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      category: p.category || 'Daily',
      price: p.price ?? '',
      discountPercent: p.discountPercent ?? 0,
      includedMileage: p.includedMileage || 'Unlimited',
      description: p.description || '',
      perksText: (p.perks || []).join(', '),
      isActive: p.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price) || 0,
        discountPercent: Number(form.discountPercent) || 0,
        includedMileage: form.includedMileage,
        description: form.description,
        perks: form.perksText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };

      if (editingId) {
        await apiClient.put(`/catalog/packages/${editingId}`, payload);
        toast.success('Package updated!');
      } else {
        await apiClient.post('/catalog/packages', payload);
        toast.success('Rental package created!');
      }
      setModalOpen(false);
      await loadPackages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (pkg) => {
    try {
      await apiClient.patch(`/catalog/packages/${pkg._id}/toggle`);
      toast.success(`${pkg.name} ${pkg.isActive ? 'disabled' : 'enabled'}`);
      await loadPackages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Delete package "${pkg.name}"?`)) return;
    try {
      await apiClient.delete(`/catalog/packages/${pkg._id}`);
      toast.success('Package deleted.');
      await loadPackages();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental Package Management"
        subtitle="Create special rental packages, seasonal discounts, and toggle offers."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={loadPackages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Package
            </Button>
          </div>
        }
      />

      {loading ? (
        <Card className="p-10 flex justify-center">
          <Spinner label="Loading rental packages..." />
        </Card>
      ) : packages.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={Package}
            title="No rental packages created"
            description="Create Daily, Weekly, Wedding, or Airport Transfer packages for customers to choose during booking."
            action={<Button onClick={openCreate}>Create Package</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg._id} className="p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-ds-royal">
                    {pkg.category}
                  </span>
                  <button
                    onClick={() => handleToggle(pkg)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold cursor-pointer ${
                      pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <h3 className="text-lg font-bold text-ds-ink">{pkg.name}</h3>
                <p className="text-xs text-ds-muted">{pkg.description || 'No description provided.'}</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-ds-ink pt-1">
                  <span>Price: {formatMoney(pkg.price)}</span>
                  {pkg.discountPercent > 0 && (
                    <span className="text-emerald-600">{pkg.discountPercent}% Discount</span>
                  )}
                </div>
                <p className="text-[11px] text-ds-muted">Mileage: {pkg.includedMileage}</p>
              </div>

              <div className="flex justify-end gap-1.5 border-t border-slate-100 pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(pkg)}>
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg)} className="text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ds-navy/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden ds-animate-in">
            <div className="bg-ds-navy px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{editingId ? 'Edit Package' : 'Create Rental Package'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-white/15 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Package Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Weekend Getaway Deal"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Airport Transfer">Airport Transfer</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Included Mileage</label>
                  <input
                    value={form.includedMileage}
                    onChange={(e) => setForm({ ...form, includedMileage: e.target.value })}
                    placeholder="300 km"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Flat Add-on Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ds-ink">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ds-ink">Perks (comma separated)</label>
                <input
                  value={form.perksText}
                  onChange={(e) => setForm({ ...form, perksText: e.target.value })}
                  placeholder="Free 2nd driver, 24/7 support"
                  className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Package'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
