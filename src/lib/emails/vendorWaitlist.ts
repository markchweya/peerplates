export function vendorWaitlistEmail(params: { fullName: string }) {
  const name = (params.fullName || "there").trim();

  const subject = "You’re officially on the PeerPlates Vendor Waitlist 🎉";

  const text = `Hi ${name},

You’re officially on the PeerPlates Vendor Waitlist🎉

PeerPlates strives to help talented cooks and bakers become successful food entrepreneurs, by giving you better tools, more visibility, and easier access to customers who genuinely want what you make. 

By joining early, you’re putting yourself in a strong position to be among the first vendors we onboard for early access, giving you a head start in reaching customers, growing your brand, and earning through PeerPlates before public launch.

What happens next
- We’re currently reviewing the information you submitted on the waitlist form.
- Once we’ve assessed all answers, a member of the PeerPlates team will reach out with next steps.

Our whole team is excited and grateful you’re here. We can’t wait to support you in turning your cooking into consistent income.

Warmly,
Team PeerPlates
`;

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.6; color:#111;">
    <p>Hi ${escapeHtml(name)},</p>

    <p><strong>You’re officially on the PeerPlates Vendor Waitlist🎉</strong></p>

    <p>
      PeerPlates strives to help talented cooks and bakers become successful food entrepreneurs,
      by giving you better tools, more visibility, and easier access to customers who genuinely want what you make.
    </p>

    <p>
      By joining early, you’re putting yourself in a strong position to be among the first vendors we onboard for early access,
      giving you a head start in reaching customers, growing your brand, and earning through PeerPlates before public launch.
    </p>

    <p style="margin:18px 0 6px;"><strong>What happens next</strong></p>
    <ul style="margin:0; padding-left:18px;">
      <li>We’re currently reviewing the information you submitted on the waitlist form.</li>
      <li>Once we’ve assessed all answers, a member of the PeerPlates team will reach out with next steps.</li>
    </ul>

    <p style="margin-top:18px;">
      Our whole team is excited and grateful you’re here. We can’t wait to support you in turning your cooking into consistent income.
    </p>

    <p>Warmly,<br/>Team PeerPlates</p>
  </div>
  `;

  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return c;
    }
  });
}
