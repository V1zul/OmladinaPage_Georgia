// Sends the "Stay up to date" confirmation email through EmailJS
import { emailConfig } from './email-config.js?v=dev';

const SITE = 'https://v1zul.github.io/OmladinaPage_Georgia/';

export const emailEnabled = !!(emailConfig.publicKey && emailConfig.serviceId && emailConfig.templateId);

const TEXT = {
  bs: {
    subject: 'Dobrodošli – prijava za obavijesti Omladine ZBGA',
    preheader: 'Hvala što ste se prijavili. Javit ćemo vam se o događajima i najavama.',
    org_name: 'Omladina ZBGA',
    heading: 'Hvala na prijavi!',
    greeting: (name) => `Selam ${name},`,
    intro: 'Uspješno ste se prijavili za obavijesti Omladine Zajednice Bošnjaka Georgia. Drago nam je što ste s nama!',
    list_title: 'Šta ćete od nas dobijati:',
    item1: 'Najave predstojećih događaja i druženja',
    item2: 'Važne obavijesti Omladine i zajednice',
    item3: 'Podsjetnike prije događaja',
    details_label: 'Kontaktirat ćemo vas na:',
    button_text: 'Posjetite našu stranicu',
    privacy: 'Vaše podatke koristimo isključivo za obavijesti o događajima i najavama. Nikada ih nećemo dijeliti s drugima.',
    unsubscribe: 'Ne želite više primati obavijesti? Odgovorite na ovaj email ili odgovorite STOP na SMS poruku.',
  },
  en: {
    subject: 'Welcome – you are signed up for ZBGA Youth updates',
    preheader: 'Thanks for signing up. We will keep you posted on events and announcements.',
    org_name: 'ZBGA Youth',
    heading: 'Thank you for signing up!',
    greeting: (name) => `Salaam ${name},`,
    intro: 'You are now signed up for updates from the Youth of the Community of Bosniaks Georgia. We are glad to have you!',
    list_title: 'What you will receive:',
    item1: 'Announcements of upcoming events and socials',
    item2: 'Important youth and community announcements',
    item3: 'Reminders before events',
    details_label: 'We will contact you at:',
    button_text: 'Visit our website',
    privacy: 'We use your information only for event updates and announcements. We will never share it with anyone.',
    unsubscribe: 'No longer want updates? Reply to this email, or reply STOP to any text message.',
  },
};

export async function sendConfirmation({ name, email, phone, lang }) {
  if (!emailEnabled) return false;
  const t = TEXT[lang] || TEXT.bs;
  const firstName = name.split(' ')[0];
  const params = {
    ...t,
    greeting: t.greeting(firstName),
    to_name: name,
    to_email: email,
    phone,
    lang,
    site_url: SITE,
    logo_url: SITE + 'images/logo.png',
  };
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: emailConfig.serviceId,
      template_id: emailConfig.templateId,
      user_id: emailConfig.publicKey,
      template_params: params,
    }),
  });
  if (!res.ok) throw new Error('EmailJS ' + res.status + ': ' + (await res.text()));
  return true;
}
