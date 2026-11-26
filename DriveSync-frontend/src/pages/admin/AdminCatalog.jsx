import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Car, Edit2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EmptyState, Spinner } from '../../components/ui/States';
import apiClient from '../../api/apiClient';
import { getErrorMessage } from '../../api/httpClient';
import { formatMoney } from '../../utils/format';

const EMPTY_FORM = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  dailyRate: '',
  location: 'Colombo',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  seats: 5,
  luggageCapacity: '2 Large Bags',
  mileageLimit: '150 km / day',
  hasAC: true,
  imageUrl: '',
  isAvailable: true,
};

export default function AdminCatalog() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/catalog');
      setVehicles(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditingId(v._id);
    setForm({
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      category: v.category || 'Sedan',
      dailyRate: v.dailyRate ?? '',
      location: v.location || '',
      fuelType: v.fuelType || 'Petrol',
      transmission: v.transmission || 'Automatic',
      seats: v.seats || 5,
      luggageCapacity: v.luggageCapacity || '2 Large Bags',
      mileageLimit: v.mileageLimit || '150 km / day',
      hasAC: v.hasAC !== false,
      imageUrl: v.imageUrl || '',
      isAvailable: v.isAvailable !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        dailyRate: Number(form.dailyRate),
        seats: Number(form.seats),
        status: form.isAvailable ? 'Available' : 'Under Maintenance',
      };

      if (editingId) {
        await apiClient.put(`/catalog/${editingId}`, payload);
        toast.success('Vehicle updated successfully!');
      } else {
        await apiClient.post('/catalog', payload);
        toast.success('New vehicle added to catalog!');
      }
      setModalOpen(false);
      await loadVehicles();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (v) => {
    try {
      const nextAvailable = !v.isAvailable;
      await apiClient.patch(`/catalog/${v._id}/availability`, {
        isAvailable: nextAvailable,
        status: nextAvailable ? 'Available' : 'Under Maintenance',
      });
      toast.success(`${v.brand} ${v.model} marked ${nextAvailable ? 'Available' : 'Unavailable'}`);
      await loadVehicles();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete ${v.brand} ${v.model} from catalog?`)) return;
    try {
      await apiClient.delete(`/catalog/${v._id}`);
      toast.success('Vehicle deleted.');
      await loadVehicles();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Vehicle Management"
        subtitle="Add, edit, or remove rental vehicles shown to customers in the public showcase."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={loadVehicles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        }
      />

      {loading ? (
        <Card className="p-10 flex justify-center">
          <Spinner label="Loading catalog vehicles..." />
        </Card>
      ) : vehicles.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={Car}
            title="No vehicles in catalog"
            description="Add your first rental vehicle so customers can browse and book it."
            action={<Button onClick={openCreate}>Add Vehicle</Button>}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ds-surface text-xs font-bold uppercase tracking-wider text-ds-muted">
                <tr>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Category & Specs</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Daily Rate</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-ds-ink">
                        {v.brand} {v.model}
                      </p>
                      <p className="text-xs text-ds-muted">{v.year}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ds-muted">
                      <span className="font-semibold text-ds-ink">{v.category}</span> &bull; {v.transmission || 'Automatic'} &bull;{' '}
                      {v.fuelType || 'Petrol'} &bull; {v.seats || 5} Seats
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-ds-ink">{v.location}</td>
                    <td className="px-5 py-3.5 font-bold text-ds-royal">{formatMoney(v.dailyRate)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(v)}
                        className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition ${
                          v.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {v.isAvailable ? 'Available' : v.status || 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(v)}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ds-navy/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden ds-animate-in my-auto">
            <div className="bg-ds-navy px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-white/15 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Brand</label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Toyota"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Model</label>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="Corolla Axio"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Year</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
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
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Daily Rate (LKR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                    placeholder="12000"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Location</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Colombo"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Transmission</label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Fuel Type</label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ds-ink">Mileage Limit</label>
                  <input
                    value={form.mileageLimit}
                    onChange={(e) => setForm({ ...form, mileageLimit: e.target.value })}
                    placeholder="150 km / day"
                    className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ds-ink">Image URL (Optional)</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/car.jpg"
                  className="w-full rounded-xl bg-ds-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ds-royal"
                />
              </div>

              <div className="flex items-center gap-6 text-xs font-semibold text-ds-ink">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasAC}
                    onChange={(e) => setForm({ ...form, hasAC: e.target.checked })}
                    className="h-4 w-4 rounded text-ds-royal"
                  />
                  Air Conditioned (AC)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    className="h-4 w-4 rounded text-ds-royal"
                  />
                  Available for Rent
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
