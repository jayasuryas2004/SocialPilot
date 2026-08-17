import client, { USE_MOCK } from "./client";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Frontend never talks to Gmail directly — no SMTP credentials belong in
// browser code. It POSTs to your backend, which uses either Gmail's API
// (with an OAuth app, same mechanism as the Connect Accounts flow) or a
// transactional email service (Resend/SendGrid) to actually send the mail
// to your business inbox.
export async function submitContactForm(payload) {
  // payload: { name, email, company, inquiryType, message }
  if (USE_MOCK) {
    await delay(700);
    return { success: true };
  }
  const { data } = await client.post("/contact", payload);
  return data;
}