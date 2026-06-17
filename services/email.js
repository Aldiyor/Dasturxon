const { Resend } = require('resend');

async function sendConfirmationEmail(booking, lang = 'uz') {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { guestName, restaurant, date, time, party, ref, email, address } = booking;

  const baseUrl = process.env.APP_URL || 'https://dasturxon-rho.vercel.app';
  const manageUrl = `${baseUrl}/manage.html?ref=${ref}&lang=${lang}`;
  const cancelUrl = `${baseUrl}/manage.html?ref=${ref}&lang=${lang}&action=cancel`;

  const t = {
    uz: {
      subject: `Bron tasdiqlandi — ${restaurant} · ${date}, ${time}`,
      confirmed: 'Bron tasdiqlandi',
      guests: 'mehmon',
      manage: 'Bronni boshqarish',
      cancel: 'Bekor qilish',
      refLabel: 'Bron kodi',
      sentBy: `Dasturxon orqali yuborildi`,
    },
    ru: {
      subject: `Bron podtverzhdeno — ${restaurant} · ${date}, ${time}`,
      confirmed: 'Bron podtverzhdeno',
      guests: 'gost.',
      manage: 'Upravleniye bronej',
      cancel: 'Otmena',
      refLabel: 'Kod bronirovaniya',
      sentBy: `Otpravleno cherez Dasturxon`,
    },
    en: {
      subject: `Reservation confirmed — ${restaurant} · ${date} at ${time}`,
      confirmed: 'Reservation confirmed',
      guests: 'guest(s)',
      manage: 'Manage reservation',
      cancel: 'Cancel',
      refLabel: 'Reference code',
      sentBy: `Sent via Dasturxon`,
    },
  }[lang] || {
    subject: `Bron tasdiqlandi — ${restaurant}`,
    confirmed: 'Bron tasdiqlandi',
    guests: 'mehmon',
    manage: 'Bronni boshqarish',
    cancel: 'Bekor qilish',
    refLabel: 'Bron kodi',
    sentBy: 'Dasturxon orqali yuborildi',
  };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:28px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e0d8;">

  <tr><td style="background:#1c3d2e;padding:28px 36px;text-align:center;">
    <p style="margin:0;font-size:22px;font-weight:600;color:#e8f0eb;letter-spacing:0.05em;">${restaurant}</p>
    <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">${t.confirmed}</p>
  </td></tr>

  <tr><td style="padding:28px 36px;text-align:center;border-bottom:1px solid #e5e0d8;">
    <p style="margin:0 0 4px;font-size:16px;color:#6b6660;">${guestName}</p>
    <p style="margin:0 0 6px;font-size:22px;font-weight:600;color:#1a1a18;">${date}</p>
    <p style="margin:0 0 20px;font-size:16px;color:#1a1a18;">${party} ${t.guests} · ${time}</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding-right:12px;">
          <a href="${manageUrl}" style="color:#1c3d2e;font-size:13px;text-decoration:underline;">${t.manage}</a>
        </td>
        <td style="border-left:1px solid #ccc;padding-left:12px;">
          <a href="${cancelUrl}" style="color:#1c3d2e;font-size:13px;text-decoration:underline;">${t.cancel}</a>
        </td>
      </tr>
    </table>
  </td></tr>

  ${address ? `
  <tr><td style="padding:16px 36px;text-align:center;border-bottom:1px solid #e5e0d8;">
    <p style="margin:0;font-size:13px;color:#6b6660;">${address}</p>
  </td></tr>` : ''}

  <tr><td style="padding:16px 36px;text-align:center;background:#f5f3ef;">
    <p style="margin:0 0 4px;font-size:11px;color:#9b9690;text-transform:uppercase;letter-spacing:0.08em;">${t.refLabel}</p>
    <p style="margin:0;font-family:monospace;font-size:20px;letter-spacing:0.2em;color:#7a5c2e;">${ref}</p>
  </td></tr>

  <tr><td style="padding:12px 36px;text-align:center;border-top:1px solid #e5e0d8;">
    <p style="margin:0;font-size:11px;color:#b0aba5;">${t.sentBy}</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: t.subject,
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

  const t = {
    uz: { subject: `Bron bekor qilindi — ${restaurant}`, body: `Salom ${guestName}, "${restaurant}" da broningiz (${date}, ${time}) bekor qilindi. Kod: <b>${ref}</b>` },
    ru: { subject: `Bronya otmenena — ${restaurant}`, body: `Zdravstvuyte ${guestName}, vasha bronya v "${restaurant}" (${date}, ${time}) otmenena. Kod: <b>${ref}</b>` },
    en: { subject: `Reservation cancelled — ${restaurant}`, body: `Hi ${guestName}, your reservation at "${restaurant}" on ${date} at ${time} has been cancelled. Ref: <b>${ref}</b>` },
  }[lang] || { subject: `Bron bekor qilindi — ${restaurant}`, body: `Broningiz bekor qilindi. Kod: <b>${ref}</b>` };

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: t.subject,
    html: `<p>${t.body}</p>`,
  });

  if (error) throw error;
  return data;
}

module.exports = { sendConfirmationEmail, sendCancellationEmail };
