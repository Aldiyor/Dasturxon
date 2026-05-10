const supabase = require('../lib/db');

module.exports = async function handler(req, res) {
  const { ref } = req.body;
  if (!ref) return res.status(400).json({ error: 'Ref kiritilmagan' });
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('ref', ref.toUpperCase());
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
};
