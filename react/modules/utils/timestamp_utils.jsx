// Normalizes chat message timestamps to a stable numeric millisecond value
// for sorting. The DB column is `timestamp without time zone`, and the Node
// server stores LOCAL wall-clock ISO strings (no Z). Different drivers treat
// the no-Z value differently:
//
//   - Flask/psycopg2: returns a naive datetime → isoformat() with no Z →
//     browser parses as local time (matches the stored wall clock).
//   - Node pg driver: returns a Date object → JSON serializes with Z (UTC
//     equivalent of the local wall clock) → browser parses as UTC → converts
//     to the same local time.
//
// Both paths display the same local time, so we just need to ensure sorting
// works by converting any format to a comparable number. We do NOT append Z
// to no-Z strings — that would treat them as UTC and introduce a 4h offset.
export function normalizeTimestamp(ts) {
    if (ts == null) return 0;
    if (typeof ts === 'number') return ts;
    const s = String(ts);
    const d = new Date(s);
    return isNaN(d) ? 0 : d.getTime();
}