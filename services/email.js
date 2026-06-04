const { Resend } = require('resend');

async function sendConfirmationEmail(booking, lang = 'uz') {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { guestName, restaurant, date, time, party, ref, email } = booking;

  const subjects = {
    uz: `Bron tasdiqlandi — ${restaurant} · ${date}, ${time}`,
    ru: `Bronirovaniye podtverzhdeno — ${restaurant} · ${date}, ${time}`,
    en: `Reservation confirmed — ${restaurant} · ${date} at ${time}`,
  };

  const bodies = {
    uz: `<p>Salom <b>${guestName}</b>,</p>
         <p>"<b>${restaurant}</b>" da stolingiz bron qilindi.</p>
         <p>📅 <b>${date}</b> soat <b>${time}</b><br/>
         👥 <b>${party}</b> mehmon</p>
         <p>Bron kodi: <b style="font-size:18px;letter-spacing:0.1em;">${ref}</b></p>
         <p style="color:#666;font-size:12px;">DasturxonBook tomonidan yuborildi</p>`,
    ru: `<p>Zdravstvuyte, <b>${guestName}</b>,</p>
         <p>Vash stol v "<b>${restaurant}</b>" podtverzhdyon.</p>
         <p>📅 <b>${date}</b> v <b>${time}</b><br/>
         👥 <b>${party}</b> gost.</p>
         <p>Kod bronirovaniya: <b style="font-size:18px;letter-spacing:0.1em;">${ref}</b></p>
         <p style="color:#666;font-size:12px;">Otpravleno cherez DasturxonBook</p>`,
    en: `<p>Hi <b>${guestName}</b>,</p>
         <p>Your table at "<b>${restaurant}</b>" is confirmed.</p>
         <p>📅 <b>${date}</b> at <b>${time}</b><br/>
         👥 <b>${party}</b> guest(s)</p>
         <p>Reference: <b style="font-size:18px;letter-spacing:0.1em;">${ref}</b></p>
         <p style="color:#666;font-size:12px;">Sent via DasturxonBook</p>`,
  };

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: subjects[lang] || subjects.uz,
    html: bodies[lang] || bodies.uz,
  });

  if (error) throw error;
  return data;
}

async function sendCancellationEmail(booking, lang = 'uz') {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { guestName, restaurant, date, time, ref, email } = booking;

  const subjects = {
    uz: `Bron bekor qilindi — ${restaurant}`,
    ru: `Bronya otmenena — ${restaurant}`,
    en: `Reservation cancelled — ${restaurant}`,
  };

  const bodies = {
    uz: `<p>Salom ${guestName}, "${restaurant}" da broningiz (${date}, ${time}) bekor qilindi. Kod: <b>${ref}</b></p>`,
    ru: `<p>Zdravstvuyte ${guestName}, vasha bronya v "${restaurant}" (${date}, ${time}) otmenena. Kod: <b>${ref}</b></p>`,
    en: `<p>Hi ${guestName}, your reservation at "${restaurant}" on ${date} at ${time} has been cancelled. Ref: <b>${ref}</b></p>`,
  };

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: subjects[lang] || subjects.uz,
    html: bodies[lang] || bodies.uz,
  });

  if (error) throw error;
  return data;
}

module.exports = { sendConfirmationEmail, sendCancellationEmail };
