// =============================================================
//  Human-friendly maintenance IDs, e.g. MNT-20261112-1A2B3C4D
// =============================================================
import crypto from 'crypto';

const datePart = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const randomPart = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export const generateMaintenanceId = () => `MNT-${datePart()}-${randomPart()}`;
