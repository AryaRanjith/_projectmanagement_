from django.core.mail import send_mail
from django.conf import settings

def send_invitation_email(invitation, invite_link):
    """
    Sends an invitation email to the invited employee.
    """
    subject = f"Invitation to join {invitation.organisation.name}"
    
    message = f"""
Hello,

You have been invited by {invitation.invited_by.get_full_name() or invitation.invited_by.username} to join {invitation.organisation.name} as an {invitation.employee_role}.

To accept this invitation and set up your account, please click the link below:
{invite_link}

Best regards,
{invitation.organisation.name} Team
"""
    
    html_message = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">You're Invited!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            You have been invited by <strong>{invitation.invited_by.get_full_name() or invitation.invited_by.username}</strong> to join <strong>{invitation.organisation.name}</strong> as an <strong>{invitation.employee_role}</strong>.
        </p>
        <div style="margin: 32px 0;">
            <a href="{invite_link}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Accept Invitation</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            If you did not expect this invitation, you can safely ignore this email.
        </p>
    </div>
    """

    from_email = f"{invitation.organisation.name} <{settings.EMAIL_HOST_USER}>"

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[invitation.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending invitation email: {e}")
        return False
