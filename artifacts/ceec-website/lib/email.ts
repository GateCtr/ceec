const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:3000");

function buildInviteLink(token: string) {
  return `${BASE_URL}/setup/${token}`;
}

function inviteEmailHtml(egliseNom: string, inviteLink: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#1e3a8a,#1e2d6b);padding:36px 40px;text-align:center">
      <div style="font-size:13px;color:#fcd34d;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">CEEC — Communauté Évangélique</div>
      <h1 style="color:white;margin:0;font-size:26px;font-weight:800">Invitation à rejoindre la plateforme</h1>
    </div>
    <div style="padding:36px 40px">
      <p style="color:#374151;font-size:16px;line-height:1.6;margin-top:0">Bonjour,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6">
        Vous avez été désigné(e) comme administrateur principal de l&apos;église
        <strong style="color:#1e3a8a">${egliseNom}</strong> sur la plateforme CEEC.
      </p>
      <p style="color:#374151;font-size:16px;line-height:1.6">
        Cliquez sur le bouton ci-dessous pour créer votre compte et configurer votre espace de gestion d&apos;église.
      </p>
      <div style="text-align:center;margin:36px 0">
        <a href="${inviteLink}"
          style="display:inline-block;background:#1e3a8a;color:white;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:700;text-decoration:none">
          Configurer mon espace →
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;line-height:1.6">
        Ce lien est valable 7 jours. Si vous n&apos;avez pas demandé cette invitation, vous pouvez ignorer cet email.
      </p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0">
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">
        Lien direct : <a href="${inviteLink}" style="color:#1e3a8a">${inviteLink}</a>
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0">CEEC — Communauté des Églises Évangéliques du Congo</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendInviteEmail(
  to: string,
  token: string,
  egliseNom: string
): Promise<{ success: boolean; error?: string }> {
  const inviteLink = buildInviteLink(token);
  const subject = `Invitation — Configurez l'espace de ${egliseNom} sur CEEC`;
  const html = inviteEmailHtml(egliseNom, inviteLink);

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("=== EMAIL (Resend non configuré — affichage console) ===");
    console.log(`À : ${to}`);
    console.log(`Objet : ${subject}`);
    console.log(`Lien d'invitation : ${inviteLink}`);
    console.log("=========================================================");
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: "CEEC Platform <noreply@ceec.cd>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: String(err) };
  }
}
