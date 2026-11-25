// =============================================================
//  Vehicle status "state machine"
//
//  A vehicle can only move between statuses along these arrows.
//  Example: a car that is "Rented" (with a customer) cannot jump
//  to "Inactive" - it must be returned first.
//
//      Available ─────► Rented ─────► Available (returned OK)
//          │               └────────► Under Maintenance (returned damaged)
//          ├──► Under Maintenance ──► Available (repair done)
//          │               └────────► Inactive (written off)
//          └──► Inactive ───────────► Available / Under Maintenance
// =============================================================
export const VEHICLE_STATUSES = ['Available', 'Rented', 'Under Maintenance', 'Inactive'];

export const STATUS_TRANSITIONS = {
  Available: ['Rented', 'Under Maintenance', 'Inactive'],
  Rented: ['Available', 'Under Maintenance'],
  'Under Maintenance': ['Available', 'Inactive'],
  Inactive: ['Available', 'Under Maintenance'],
};

/** true if moving from -> to is allowed */
export const canTransition = (from, to) => (STATUS_TRANSITIONS[from] || []).includes(to);
