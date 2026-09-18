---
version: 1
slug: "src-layouts-splitauth-js"
primary_target: "src/layouts/SplitAuth.js"
related_targets: ["src/screens/Auth/Login.js","src/screens/Auth/Signup.js","src/screens/Auth/ForgotPassword.js","src/screens/Auth/ResetPassword.js"]
---

# Surface brief — Split-screen auth (Login / Signup / Forgot / Reset)

**Scope / mode:** Operate. The four primary auth entry screens — Login, Signup, Forgot Password, Reset Password — sharing one new split-screen layout. ConfirmCode, AcceptInvite, Logout, and Lockout stay on the existing plain `BasicLayout`; they are not part of this brief.

**Audience / job / action:** Same two audiences as the rest of the console — operators signing in to do their job, and adopting developers evaluating the boilerplate. The job is completing the form fast; the right panel's job is a passive, always-available trust signal, never an interruption.

**Proof / constraints:** Product truth only — organizations/shops/products/users management, RBAC with a full audit log, and the white-label single-token rebrand — no invented claims. Full light + dark parity. Reuses existing `Card`, `Button`, `Input`, `Form` components and `.card-soft`/`--app-base`/`--app-aurora` tokens verbatim; no new tokens.

**Memorable moment:** The right panel is the console's own dark mode, not a stock illustration — same aurora glow the operator sees every day, doing the selling with typography alone.

**Unresolved:** none — direction, split ratio, and content are locked by the user.

## Direction contract

THESIS: Auth is the first thing anyone sees, and it should earn trust without competing with the actual job of logging in. The category default splits 50/50 and fills the promo half with stock photography or an illustration; this refuses both — the promo third is typography and the console's own dark aurora glow, nothing borrowed from outside the product.

OWN-WORLD: Left two-thirds sits on the app's own light aurora ground (`--app-base` + `--app-aurora`) with the form floating in a real `.card-soft` card — identical radius and Highlight + Shadow to every other Card in the app. Right third is the console's dark mode itself: near-black `--app-base`/`--app-aurora`, a Bricolage headline, three check-marked bullets in Geist. No card, no screenshot, no kicker/eyebrow above the headline.

STORY: An operator or evaluating developer lands, sees Bedrock's own icon and a familiar card-shaped form already doing the work, and reads three concrete facts about the console in peripheral vision — never a hard sell, always visible, never in the way of the form.

FIRST VIEWPORT: `logo-icon.svg` centered above the card. Inside the card: heading, the screen's real fields, primary button, secondary links, OAuth row where applicable. Right third: headline + three bullets vertically centered on the dark aurora ground, no card.

FORM: Minimal Manifesto, refined — 2/3 form · 1/3 content split. Reached via a three-way surface round (seed key 66741d3f, dealt structures 6/4/1), then refined per user feedback: card treatment restored on an aurora ground instead of a flat panel, ratio shifted from the initial 36/64 toward the form.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
