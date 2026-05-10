const supabase = require('../lib/db');

module.exports = async function handler(req, res) {
  const { ref } = req.params;
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('ref', ref.toUpperCase())
    .single();
  if (error || !data) return res.status(404).json({ error: 'Bron topilmadi' });
  return res.status(200).json({ reservation: data });
};
