const { Resend } = require('resend');

async function sendConfirmationEmail(booking, lang = 'uz') {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { guestName, restaurant, date, time, party, ref, email, address } = booking;

  const manageUrl = `${process.env.APP_URL || 'https://dasturxon.vercel.app'}/?view=manage&ref=${ref}`;
const cancelUrl = `${process.env.APP_URL || 'https://dasturxon.vercel.app'}/?view=cancel&ref=${ref}`;

  const subjects = {
    uz: `Bron tasdiqlandi — ${restaurant} · ${date}, ${time}`,
    ru: `Bronirovaniye podtverzhdeno — ${restaurant} · ${date}, ${time}`,
    en: `Reservation confirmed — ${restaurant} · ${date} at ${time}`,
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:28px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e0d8;">

  <tr><td style="background:#1c3d2e;padding:28px 36px;text-align:center;">
    <p style="margin:0;font-size:22px;font-weight:600;color:#e8f0eb;letter-spacing:0.05em;">${restaurant}</p>
    <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">Bron tasdiqlandi</p>
  </td></tr>

  <tr><td style="padding:28px 36px;text-align:center;border-bottom:1px solid #e5e0d8;">
    <p style="margin:0 0 4px;font-size:16px;color:#6b6660;">${guestName}</p>
    <p style="margin:0 0 6px;font-size:22px;font-weight:600;color:#1a1a18;">${date}</p>
    <p style="margin:0 0 20px;font-size:16px;color:#1a1a18;">${party} mehmon · ${time}</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding-right:12px;">
          <a href="${manageUrl}" style="color:#1c3d2e;font-size:13px;text-decoration:underline;">bronni boshqarish</a>
        </td>
        <td style="border-left:1px solid #ccc;padding-left:12px;">
          <a href="${cancelUrl}" style="color:#1c3d2e;font-size:13px;text-decoration:underline;">bekor qilish</a>
        </td>
      </tr>
    </table>
  </td></tr>

  ${address ? `
  <tr><td style="padding:16px 36px;text-align:center;border-bottom:1px solid #e5e0d8;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1a1a18;">Manzil</p>
    <p style="margin:0;font-size:13px;color:#6b6660;">${address}</p>
  </td></tr>` : ''}

  <tr><td style="padding:16px 36px;text-align:center;background:#f5f3ef;">
    <p style="margin:0;font-size:12px;color:#9b9690;">Bron kodi: <b style="font-family:monospace;font-size:15px;letter-spacing:0.15em;color:#7a5c2e;">${ref}</b></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: subjects[lang] || subjects.uz,
    html,
  });

  if (error) {
    console.error('Resend error:', JSON.stringify(error));
    throw error;
  }
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

  if (error) {
    console.error('Resend error:', JSON.stringify(error));
    throw error;
  }
  return data;
}

module.exports = { sendConfirmationEmail, sendCancellationEmail };
