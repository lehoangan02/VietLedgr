import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_invite_email(
    *, to_email: str, invite_code: str, role_name: str, store_name: str
) -> None:
    subject = "[VIETLEDGR - INVITATION] You are invited to Vietledgr"

    lines = [
        "You have been invited to VietLedgr.",
        "",
        f"Invite code: {invite_code}",
        f"Role: {role_name}",
        f"Store: {store_name}",
        "",
        "This invite code can be used once.",
    ]

    msg = MIMEMultipart()
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["subject"] = subject
    msg.attach(MIMEText("\n".join(lines), "plain", "utf-8"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.MAIL_FROM_EMAIL, [to_email], msg.as_string())
