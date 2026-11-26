import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock3, FileUp, Mail, MapPin, Phone, ShieldAlert, ShieldCheck, User, XCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/States';
import apiClient from '../api/apiClient';
import { getErrorMessage } from '../api/httpClient';
import { API_BASE_URL } from '../config/appConfig';

const STATUS_BADGES = {
  Verified: { color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2, label: 'Verified' },
  Pending: { color: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock3, label: 'Pending Review' },
  Rejected: { color: 'bg-rose-50 text-rose-700 ring-rose-200', icon: XCircle, label: 'Rejected' },
  'Not Submitted': { color: 'bg-slate-100 text-slate-600 ring-slate-200', icon: ShieldAlert, label: 'Not Submitted' },
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // License verification state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [file, setFile] = useState(null);
  const [licenseUrl, setLicenseUrl] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/profile');
      const userData = res.data?.data || res.data;
      setProfile(userData);
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setLicenseNumber(userData.licenseNumber || '');
      setLicenseUrl(userData.drivingLicenseUrl || '');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiClient.put('/auth/profile', { name, phone, address });
      const updated = res.data?.data;
      setProfile(updated);

      // Keep localStorage user synced
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: updated.name }));

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!licenseNumber && !file && !licenseUrl) {
      toast.error('Please enter your license number or select a license document.');
      return;
    }

    setSubmittingDoc(true);
    try {
      const formData = new FormData();
      if (licenseNumber) formData.append('licenseNumber', licenseNumber);
      if (file) {
        formData.append('document', file);
      } else if (licenseUrl) {
        formData.append('drivingLicenseUrl', licenseUrl);
      }

      await apiClient.post('/auth/verify-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Driving license submitted for verification!');
      setFile(null);
      await loadProfile();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmittingDoc(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-10 flex justify-center">
        <Spinner label="Loading your profile..." />
      </Card>
    );
  }

  const docStatus = profile?.documentStatus || (profile?.isVerified ? 'Verified' : 'Not Submitted');
  const badge = STATUS_BADGES[docStatus] || STATUS_BADGES['Not Submitted'];
  const BadgeIcon = badge.icon;

  const previewUrl = profile?.drivingLicenseUrl
    ? profile.drivingLicenseUrl.startsWith('http')
      ? profile.drivingLicenseUrl
      : `${API_BASE_URL}/api/auth${profile.drivingLicenseUrl}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Document Verification"
        subtitle="Manage your personal details and submit your driving license to rent vehicles."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info Card */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ds-royal text-lg font-bold text-white">
              {(profile?.name || 'U').slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h3 className="text-lg font-bold text-ds-ink">{profile?.name}</h3>
              <p className="text-xs text-ds-muted flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {profile?.email} &bull;{' '}
                <span className="font-semibold text-ds-royal">{profile?.role}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                <User className="h-3.5 w-3.5 text-ds-royal" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                <Phone className="h-3.5 w-3.5 text-ds-royal" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ds-ink">
                <MapPin className="h-3.5 w-3.5 text-ds-royal" /> Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City"
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Driving License Verification Card */}
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-ds-royal">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-ds-ink">Driving License Verification</h3>
                <p className="text-xs text-ds-muted">Required before vehicle handover</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${badge.color}`}>
              <BadgeIcon className="h-3.5 w-3.5" />
              {badge.label}
            </span>
          </div>

          {docStatus === 'Rejected' && profile?.rejectionReason && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <strong>Rejection Reason:</strong> {profile.rejectionReason}
            </div>
          )}

          {previewUrl && (
            <div className="rounded-xl bg-ds-surface p-3 flex items-center justify-between text-xs">
              <span className="font-medium text-ds-ink">Current Submitted Document</span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-ds-link hover:underline"
              >
                View Document &rarr;
              </a>
            </div>
          )}

          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ds-ink">
                Driving License Number
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g., B1234567"
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm text-ds-ink outline-none focus:ring-2 focus:ring-ds-royal"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ds-ink">
                Upload License Photo / PDF (Max 5MB)
              </label>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-ds-surface/60 p-5 text-center cursor-pointer hover:border-ds-royal transition">
                <FileUp className="h-6 w-6 text-ds-royal mb-1.5" />
                <span className="text-xs font-semibold text-ds-ink">
                  {file ? file.name : 'Click to choose JPEG, PNG, WEBP, or PDF'}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submittingDoc}>
                {submittingDoc ? 'Submitting...' : docStatus === 'Verified' ? 'Re-submit License' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
