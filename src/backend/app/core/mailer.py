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
    subject = "[VietLedgr] Invitation code"

    text_lines = [
        "You have been invited to VietLedgr.",
        "",
        f"Invite code: {safe_code}",
        f"Role: {safe_role}",
        f"Store: {safe_store}",
        "",
        "This code can be used once.",
    ]

    html = f"""
    <html>
      <body>
        <p>You have been invited to VietLedgr.</p>
        <p><b>Invite code:</b> {safe_code}</p>
        <p><b>Role:</b> {safe_role}<br/><b>Store:</b> {safe_store}</p>
        <p>This code can be used once.</p>
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
