async function sendSMS(to, text) {
  const phone = to.replace(/^\+/, '');

  const res = await fetch('https://devsms.uz/api/send-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEVSMS_API_KEY}`,
    },
    body: JSON.stringify({ phone, text }),
  });

  const data = await res.json();
  console.log('DevSMS response:', JSON.stringify(data));
  return data;
}

function buildConfirmationMessage(booking, lang) {
  const { guestName, restaurant, date, time, party, ref } = booking;
  const messages = {
    uz: `Salom ${guestName}! "${restaurant}" da stolingiz bron qilindi. ${date}, soat ${time}. ${party} mehmon. Kod: ${ref}`,
    ru: `Zdravstvuyte ${guestName}! Stol v "${restaurant}" podtverzhdyon. ${date} v ${time}. ${party} gost. Kod: ${ref}`,
    en: `Hi ${guestName}! Table at "${restaurant}" confirmed. ${date} at ${time}. ${party} guest(s). Ref: ${ref}`,
  };
  return messages[lang] || messages.uz;
}

function buildCancellationMessage(booking, lang) {
  const { guestName, restaurant, date, time, ref } = booking;
  const messages = {
    uz: `Salom ${guestName}. "${restaurant}" da broningiz (${date}, ${time}) bekor qilindi. Kod: ${ref}`,
    ru: `Zdravstvuyte ${guestName}. Bronya v "${restaurant}" (${date}, ${time}) otmenena. Kod: ${ref}`,
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
