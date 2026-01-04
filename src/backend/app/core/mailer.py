import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape

from app.core.config import settings


class MailSendError(RuntimeError):
    pass


def send_invite_email(
    *, to_email: str, invite_code: str, role_name: str, store_name: str
) -> None:
    if not settings.MAIL_ENABLED:
        return

    safe_role = escape(role_name)
    safe_store = escape(store_name)
    safe_code = escape(invite_code)

    subject = "[VietLedgr] Your invitation code"

    text_lines = [
        "You're invited to VietLedgr.",
        "",
        f"Invite code: {invite_code}",
        f"Role: {role_name}",
        f"Store: {store_name}",
        "",
        "This code can be used once.",
    ]

    html = f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>VietLedgr Invitation</title>
  </head>
  <body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Your VietLedgr invitation code: {safe_code}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb; padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">
            <tr>
              <td style="padding:12px 4px 16px 4px; text-align:left;">
                <div style="font-size:20px; font-weight:800; color:#111827;">VietLedgr</div>
                <div style="font-size:12px; color:#6b7280; margin-top:4px;">Invitation</div>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;">
                <div style="padding:24px;">
                  <h1 style="margin:0; font-size:20px; line-height:1.3; color:#111827;">
                    You're invited 🎉
                  </h1>

                  <p style="margin:12px 0 0 0; font-size:14px; line-height:1.6; color:#374151;">
                    Use the code below to create your account. This code can be used <b>once</b>.
                  </p>

                  <div style="margin:18px 0; padding:14px; background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                    <div style="font-size:12px; color:#9a3412; margin-bottom:6px; font-weight:800; letter-spacing:0.6px;">
                      INVITE CODE
                    </div>
                    <div style="font-size:22px; letter-spacing:2px; font-weight:900; color:#9a3412;">
                      {safe_code}
                    </div>
                  </div>

                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px;">
                    <tr>
                      <td style="padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px;">
                        <div style="font-size:12px; color:#6b7280;">Role</div>
                        <div style="font-size:14px; color:#111827; font-weight:700;">{safe_role}</div>
                      </td>
                      <td style="width:12px;"></td>
                      <td style="padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px;">
                        <div style="font-size:12px; color:#6b7280;">Store</div>
                        <div style="font-size:14px; color:#111827; font-weight:700;">{safe_store}</div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:18px 0 0 0; font-size:12px; line-height:1.6; color:#6b7280;">
                    If you did not expect this email, you can ignore it.
                  </p>
                </div>

                <div style="padding:14px 24px; background:#f9fafb; border-top:1px solid #e5e7eb;">
                  <div style="font-size:12px; color:#9ca3af;">
                    This is an automated message. Please do not reply.
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 4px 0 4px; text-align:center; font-size:12px; color:#9ca3af;">
                © VietLedgr
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    """.strip()

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText("\n".join(text_lines), "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()

            if settings.SMTP_USE_TLS:
                server.starttls()
                server.ehlo()

            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)

            server.sendmail(str(settings.MAIL_FROM_EMAIL), [to_email], msg.as_string())
    except Exception as e:
        raise MailSendError(str(e)) from e
