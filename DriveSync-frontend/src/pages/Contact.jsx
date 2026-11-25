import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Thank you for reaching out! Our team will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0A1F44]">Contact DriveSync</h1>
        <p className="text-sm text-ds-muted">
          Have a question about our vehicles, packages, or bookings? Send us a message anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 space-y-5 bg-[#0A1F44] text-white border-none">
          <h2 className="text-lg font-bold">Get in Touch</h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Our customer support and fleet operations desk is available 24/7 for reservations and roadside assistance.
          </p>
          <div className="space-y-4 text-xs pt-2">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#00E5FF]" />
              <span>+94 11 234 5678</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#00E5FF]" />
              <span>support@drivesync.lk</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#00E5FF]" />
              <span>No. 45, Galle Road, Colombo 03</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ds-ink">Your Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Kasun Silva"
                  className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ds-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="kasun@example.com"
                  className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ds-ink">Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Booking inquiry or fleet feedback"
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ds-ink">Message</label>
              <textarea
                rows="4"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full rounded-xl bg-ds-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={sending} className="bg-[#0A1F44] hover:bg-[#0d2858]">
                <Send className="h-4 w-4 text-[#00E5FF]" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
