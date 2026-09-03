const supabase = require('../config/supabase');

// Generates: VCH-20260903-001, VCH-20260903-002, etc.
async function generateVoucherNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20260903

  // Count how many vouchers were created today
  const startOfDay = today.toISOString().slice(0, 10); // 2026-09-03

  const { count, error } = await supabase
    .from('vouchers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${startOfDay}T00:00:00`)
    .lte('created_at', `${startOfDay}T23:59:59`);

  const nextNumber = (count || 0) + 1;
  const padded = String(nextNumber).padStart(3, '0');

  return `VCH-${dateStr}-${padded}`;
}

module.exports = generateVoucherNumber;
