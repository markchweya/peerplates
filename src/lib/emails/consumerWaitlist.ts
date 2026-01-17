// src/lib/emails/consumerWaitlist.ts

export function consumerWaitlistEmail({
  fullName,
  referralLink,
}: {
  fullName?: string | null;
  referralLink?: string | null;
}) {
  const first = (fullName || "").trim().split(" ")[0] || "there";

  const subject = "You’re on the PeerPlates waitlist 🎉";

  const text = [
    `Hi ${first},`,
    "",
    "You’re officially on the PeerPlates waitlist 🎉",
    "",
    "PeerPlates is built to deliver generous meals that taste amazing and stay affordable, made by real people in our community, not faceless chains. We’re excited to bring you a better way to eat well.",
    "",
    "You’re now in the queue.",
    "We’ll keep you posted with updates, early access drops, and launch news as we get closer to going live.",
    "",
    "Move up the waitlist",
    "Want to climb the queue faster? Share your unique referral link — every friend who signs up through your link helps you move up.",
    referralLink ? `Referral link: ${referralLink}` : "",
    "",
    "Our whole team is excited and grateful for the support. We can’t wait to deliver real value to you.",
    "",
    "Speak soon,",
    "Team PeerPlates",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.6; color:#0f172a">
    <p>Hi ${first},</p>

    <p><strong>You’re officially on the PeerPlates waitlist 🎉</strong></p>

    <p>
      PeerPlates is built to deliver generous meals that taste amazing and stay affordable,
      made by real people in our community, not faceless chains.
      We’re excited to bring you a better way to eat well.
    </p>

    <h3 style="margin:18px 0 6px">You’re now in the queue</h3>
    <p>
      We’ll keep you posted with updates, early access drops, and launch news as we get closer to going live.
    </p>

    <h3 style="margin:18px 0 6px">Move up the waitlist</h3>
    <p>
      Want to climb the queue faster? Share your unique referral link —
      every friend who signs up through your link helps you move up.
    </p>

    ${
      referralLink
        ? `<p style="margin:14px 0">
            <a href="${referralLink}"
               style="display:inline-block; background:#fcb040; color:#0f172a; text-decoration:none; font-weight:800; padding:12px 16px; border-radius:14px">
              Share your referral link
            </a>
          </p>
          <p style="font-size:12px; color:#475569">Or copy this link: ${referralLink}</p>`
        : ""
    }

    <p>
      Our whole team is excited and grateful for the support. We can’t wait to deliver real value to you.
    </p>

    <p>Speak soon,<br/>Team PeerPlates</p>
  </div>
  `;

  return { subject, text, html };
}
