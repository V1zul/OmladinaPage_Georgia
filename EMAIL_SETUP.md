# Confirmation email setup (EmailJS, free, ~10 minutes)

When someone signs up with **Ostani u toku / Stay up to date**, the website sends them a
branded confirmation email (with the ZBGA logo) in the language they used on the site.
EmailJS sends it through a Gmail account you connect. Free plan: 200 emails per month.

Until the three values in `js/email-config.js` are filled in, sign-ups still work, just without the email.

---

## 1. Create an EmailJS account
Go to <https://www.emailjs.com> → **Sign Up** (free).

## 2. Connect the Gmail that sends the emails
1. **Email Services → Add New Service → Gmail**.
2. **Connect Account** → choose the Gmail you want emails to come from
   (e.g. the Omladina / community Gmail) → allow access.
3. **Create Service**. Copy the **Service ID** (looks like `service_ab12cd3`).

## 3. Create the email template
1. **Email Templates → Create New Template**.
2. On the **Content** tab, fill in the right-hand settings:
   - **Subject:** `{{subject}}`
   - **To Email:** `{{to_email}}`
   - **From Name:** `Omladina ZBGA`
   - **Reply To:** the Gmail you connected (so "reply to unsubscribe" reaches you)
3. Click **Edit Content → Code Editor**, delete what is there, and paste the full contents of
   [`email/confirmation-template.html`](email/confirmation-template.html). **Save**.
4. Copy the **Template ID** (looks like `template_x1y2z3`).

## 4. Get your public key
**Account → General → Public Key**. Copy it.

## 5. Recommended safety settings
**Account → Security**:
- Keep **"Allow EmailJS API for non-browser applications"** turned **off**.
- If offered, set a **rate limit** (e.g. 1 request per 10 seconds) to stop anyone from abusing the form.

## 6. Connect the website
Put the three values in `js/email-config.js`, or just send them to Claude:

```js
export const emailConfig = {
  publicKey: '...',
  serviceId: 'service_...',
  templateId: 'template_...',
};
```

These values are meant to be public. No passwords go in the website.

---

### Notes
- The first emails may land in **Spam/Promotions**. Ask early subscribers to mark them "Not spam".
- Want to change the wording? Edit the `TEXT` section in `js/confirm-email.js` (Bosnian and English).
- Want to change the design? Edit `email/confirmation-template.html` and paste it into EmailJS again.
