// Site configuration. Edit before launch; nothing here is live yet.
window.AIA_CONFIG = {
  // PLACEHOLDER. URL of a waitlist endpoint that accepts the estate DemandSignal shape
  // (packages/demand-capture handler: POST JSON { productId, email, consent, role, priceBand, urgency, pain, alternative, source }).
  // Leave empty until a real endpoint exists. Do not point this at a guessed URL.
  waitlistEndpoint: "",

  // PLACEHOLDER. Address for the mailto fallback, used only while waitlistEndpoint is empty.
  // While it still contains REPLACE_ME the form says the waitlist is not open yet.
  mailtoAddress: "REPLACE_ME@example.invalid",

  productId: "ai-architect-academy"
};
