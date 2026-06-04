const supabase = require('../lib/db');
const { sendConfirmationSMS } = require('../services/sms');
const { sendConfirmationEmail } = require('../services/email');

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'BN-';
  for (let i = 0; i < 5; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

function formatPhone(raw, countryCode = '+998') {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) return '+' + digits;
  if (digits.startsWith('0')) return '+998' + digits.slice(1);
  if (digits.length === 9) return '+998' + digits;
  return countryCode + digits;
}

module.exports = async function handler(req, res) {
  const {
    restaurant, restaurantName, restaurantAddress,
    date, time, party,
    firstName, lastName, email, phone, countryCode,
    occasion, notes, lang, notifySMS, notifyEmail, source,
  } = req.body;

  if (!restaurant || !date || !time || !party || !firstName) {
    return res.status(400).json({ error: 'Majburiy maydonlar toldirilmagan' });
  }
  if (!phone && !email) {
    return res.status(400).json({ error: 'Telefon yoki email kiritish shart' });
  }

  const ref = generateRef();
  const guestName = `${firstName} ${lastName || ''}`.trim();
  const phoneE164 = phone ? formatPhone(phone, countryCode || '+998') : null;

  const booking = {
    ref,
    restaurant: restaurantName || restaurant,
    address: restaurantAddress || 'Toshkent',
    date, time,
    party: Number(party),
    guestName, email,
    phone: phoneE164,
    occasion, notes,
  };

  try {
    const { error: dbError } = await supabase.from('reservations').insert({
      ref,
      restaurant_slug: restaurant,
      date, time,
      party: Number(party),
      guest_name: guestName,
      email: email || null,
      phone: phoneE164 || null,
      occasion: occasion || null,
      notes: notes || null,
      lang: lang || 'uz',
      source: source || 'direct',
      notify_sms: !!notifySMS,
      notify_email: !!notifyEmail,
      status: 'confirmed',
    });

    if (dbError) throw dbError;

    if (notifySMS && phoneE164) {
  sendConfirmationSMS(booking, lang || 'uz')
    .catch(err => console.error('SMS xatosi:', err));
}

if (notifyEmail && email) {
  sendConfirmationEmail(booking, lang || 'uz')
    .catch(err => console.error('Email xatosi:', err));
}

    return res.status(200).json({ success: true, ref });

  } catch (err) {
    console.error('Bron xatosi:', err);
    return res.status(500).json({ error: err.message || 'Server xatosi' });
  }
};
