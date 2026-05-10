const fetch = require('node-fetch');

async function sendSMS(to, text) {
  const phone = to.replace(/^\+/, '');
  const res = await fetch('https://devsms.uz/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEVSMS_API_KEY}`,
    },
    body: JSON.stringify({ phone: phone, message: text }),
  });
  const data = await res.json();
  console.log('DevSMS response:', JSON.stringify(data));
  return data;
}

function buildConfirmationMessage(booking, lang) {
  const { guestName, restaurant, date, time, party, ref } = booking;
  const messages = {
    uz: `Salom ${guestName}! "${restaurant}" da stolingiz bron qilindi.\n📅 ${date}, soat ${time}\n👥 ${party} mehmon\nKod: ${ref}`,
    ru: `Здравствуйте, ${guestName}! Стол в "${restaurant}" подтверждён.\n📅 ${date} в ${time}\n👥 ${party} гост.\nКод: ${ref}`,
    en: `Hi ${guestName}! Table at "${restaurant}" confirmed.\n📅 ${date} at ${time}\n👥 ${party} guest(s)\nRef: ${ref}`,
  };
  return messages[lang] || messages.uz;
}

function buildCancellationMessage(booking, lang) {
  const { guestName, restaurant, date, time, ref } = booking;
  const messages = {
    uz: `Salom ${guestName}. "${restaurant}" da broningiz (${date}, ${time}) bekor qilindi. Kod: ${ref}`,
    ru: `Здравствуйте, ${guestName}. Ваша бронь в "${restaurant}" (${date}, ${time}) отменена. Код: ${ref}`,
    en: `Hi ${guestName}. Reservation at "${restaurant}" (${date}, ${time}) cancelled. Ref: ${ref}`,
  };
  return messages[lang] || messages.uz;
}

async function sendConfirmationSMS(booking, lang = 'uz') {
  return sendSMS(booking.phone, buildConfirmationMessage(booking, lang));
}
async function sendCancellationSMS(booking, lang = 'uz') {
  return sendSMS(booking.phone, buildCancellationMessage(booking, lang));
}

module.exports = { sendConfirmationSMS, sendCancellationSMS };
