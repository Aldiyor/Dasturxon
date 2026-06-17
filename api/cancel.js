const supabase = require('../lib/db');
const { sendCancellationEmail } = require('../services/email');

module.exports = async function handler(req, res) {
  const { ref, lang } = req.body;
  if (!ref) return res.status(400).json({ error: 'Ref kiritilmagan' });

  // Get booking details before cancelling so we can send email
  const { data: booking, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('ref', ref.toUpperCase())
    .single();

  if (fetchError || !booking) {
    return res.status(404).json({ error: 'Bron topilmadi' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Bu bron allaqachon bekor qilingan' });
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('ref', ref.toUpperCase());

  if (error) return res.status(500).json({ error: error.message });

  // Send cancellation email
  if (booking.email) {
    const selectedLang = lang || booking.lang || 'uz';
    sendCancellationEmail({
      guestName: booking.guest_name,
      restaurant: booking.restaurant_slug,
      date: booking.date,
      time: booking.time,
      ref: booking.ref,
      email: booking.email,
    }, selectedLang).catch(err => console.error('Cancel email error:', err.message));
  }

  return res.status(200).json({ success: true });
};
