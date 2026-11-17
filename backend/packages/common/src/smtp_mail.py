"""Optional transactional email via SMTP (Gmail, SES, Mailgun SMTP, etc.)."""
from __future__ import annotations

import asyncio
import logging
import smtplib
from datetime import date
from email.message import EmailMessage
from html import escape

from .config import get_settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    s = get_settings()
    return bool(s.SMTP_HOST and str(s.SMTP_HOST).strip())


def _card_html(
    *,
    title: str,
    intro: str,
    preheader: str,
    expiry: str,
    code: str | None = None,
    button: tuple[str, str] | None = None,
    app_name: str = "inTrendFX",
) -> str:
    """Branded email card. Tables + inline styles only (Gmail/Outlook strip <style>)."""
    base = (get_settings().TRADER_APP_URL or "https://intrendfx.com").rstrip("/")
    logo = f"{base}/landing-new/intrndfx_logo_white.png"
    support = (get_settings().SMTP_FROM or get_settings().SMTP_USER or "").split("<")[-1].strip("> ")
    font = "font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"

    if code:
        action = f"""
        <tr><td style="padding:8px 40px 4px;" align="center">
          <div style="{font}font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:600;padding-bottom:10px;">Your verification code</div>
          <div style="display:inline-block;background:#eef5ff;border:2px dashed #0158c6;border-radius:12px;padding:16px 28px;font-family:'SF Mono',Consolas,'Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:10px;color:#0158c6;">{escape(code)}</div>
        </td></tr>"""
    else:
        label, url = button  # type: ignore[misc]
        action = f"""
        <tr><td style="padding:8px 40px 4px;" align="center">
          <a href="{escape(url, quote=True)}" style="{font}display:inline-block;background:#0158c6;background-image:linear-gradient(135deg,#0158c6,#0199c6);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:10px;">{escape(label)}</a>
          <div style="{font}font-size:12px;color:#94a3b8;padding-top:14px;word-break:break-all;">Or paste this link in your browser:<br><a href="{escape(url, quote=True)}" style="color:#0158c6;">{escape(url)}</a></div>
        </td></tr>"""

    return f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">{escape(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
    <tr><td align="center" bgcolor="#0158c6" style="background:#0158c6;background-image:linear-gradient(135deg,#0158c6 0%,#0199c6 55%,#4dbe51 100%);padding:28px 24px;">
      <img src="{logo}" alt="{escape(app_name)}" width="170" style="display:block;width:170px;max-width:60%;height:auto;border:0;">
    </td></tr>
    <tr><td style="padding:36px 40px 8px;{font}">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">{escape(title)}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">{escape(intro)}</p>
    </td></tr>
    {action}
    <tr><td style="padding:16px 40px 8px;{font}" align="center">
      <p style="margin:0;font-size:13px;color:#64748b;">&#9201; {escape(expiry)}</p>
    </td></tr>
    <tr><td style="padding:20px 40px 32px;{font}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border-left:4px solid #FFB300;border-radius:8px;">
        <tr><td style="padding:12px 16px;font-size:13px;line-height:1.5;color:#7a5b00;">
          <strong>Keep this private.</strong> {escape(app_name)} will never ask for this code or link by phone, email or chat. If you didn't request this, you can safely ignore this email.
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;{font}" align="center">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Need help? <a href="mailto:{escape(support)}" style="color:#0158c6;text-decoration:none;">{escape(support)}</a><br>&copy; {date.today().year} {escape(app_name)}. All rights reserved.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>"""


def _send_plain_sync(to_email: str, subject: str, body_text: str, body_html: str | None = None) -> None:
    s = get_settings()
    msg = EmailMessage()
    msg["Subject"] = subject
    from_addr = (s.SMTP_FROM or s.SMTP_USER or "").strip()
    if not from_addr:
        raise ValueError("SMTP_FROM or SMTP_USER must be set when SMTP_HOST is set")
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    host = str(s.SMTP_HOST).strip()
    port = int(s.SMTP_PORT)
    with smtplib.SMTP(host, port, timeout=30) as server:
        if s.SMTP_USE_TLS:
            server.starttls()
        user = (s.SMTP_USER or "").strip()
        pwd = (s.SMTP_PASSWORD or "").strip()
        if user:
            server.login(user, pwd)
        server.send_message(msg)


async def send_password_reset_email(to_email: str, reset_link: str, *, app_name: str = "inTrendFX") -> bool:
    """Send reset email. Returns True if sent, False if SMTP not configured or send failed."""
    if not smtp_configured():
        return False
    subject = f"Reset your {app_name} password"
    body = (
        f"You requested a password reset for your {app_name} account.\n\n"
        f"Open this link to choose a new password (it expires in 15 minutes):\n\n"
        f"{reset_link}\n\n"
        f"If you did not request this, you can ignore this email.\n"
    )
    html = _card_html(
        title="Reset your password",
        intro=f"We received a request to reset the password for your {app_name} account. Click the button below to choose a new one.",
        preheader=f"Reset your {app_name} password — link expires in 15 minutes.",
        expiry="This link expires in 15 minutes.",
        button=("Reset password", reset_link),
        app_name=app_name,
    )
    try:
        await asyncio.to_thread(_send_plain_sync, to_email, subject, body, html)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
        return False


async def send_registration_otp(to_email: str, otp: str, *, app_name: str = "inTrendFX") -> bool:
    """Send a 6-digit email-verification OTP for new account registration.
    Returns True if sent, False if SMTP not configured or send failed."""
    if not smtp_configured():
        return False
    subject = f"Your {app_name} verification code"
    body = (
        f"Welcome to {app_name}!\n\n"
        f"Your email verification code is: {otp}\n\n"
        f"Enter this code to finish creating your account. It expires in 10 minutes.\n\n"
        f"If you did not try to sign up, you can ignore this email.\n"
    )
    html = _card_html(
        title=f"Welcome to {app_name}!",
        intro="Use the code below to verify your email address and finish creating your account.",
        preheader=f"Your {app_name} verification code is {otp}",
        expiry="This code expires in 10 minutes.",
        code=otp,
        app_name=app_name,
    )
    try:
        await asyncio.to_thread(_send_plain_sync, to_email, subject, body, html)
        return True
    except Exception:
        logger.exception("Failed to send registration OTP to %s", to_email)
        return False


async def send_password_reset_otp(to_email: str, otp: str, *, app_name: str = "inTrendFX") -> bool:
    """Send a 6-digit password-reset OTP (used by the mobile app). Returns True if sent."""
    if not smtp_configured():
        return False
    subject = f"Your {app_name} password reset code"
    body = (
        f"You requested a password reset for your {app_name} account.\n\n"
        f"Your verification code is: {otp}\n\n"
        f"Enter this code in the app to choose a new password. It expires in 15 minutes.\n\n"
        f"If you did not request this, you can ignore this email.\n"
    )
    html = _card_html(
        title="Reset your password",
        intro=f"Enter the code below in the {app_name} app to choose a new password.",
        preheader=f"Your {app_name} password reset code is {otp}",
        expiry="This code expires in 15 minutes.",
        code=otp,
        app_name=app_name,
    )
    try:
        await asyncio.to_thread(_send_plain_sync, to_email, subject, body, html)
        return True
    except Exception:
        logger.exception("Failed to send password reset OTP to %s", to_email)
        return False
