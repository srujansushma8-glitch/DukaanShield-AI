export const INJECTION_PATTERNS = [
  /\bignore\s+(?:all\s+|any\s+|the\s+)?(?:(?:previous|prior|above|system)\s+)?(?:instructions?|directions?|prompts?|rules?|guidelines?)\b/i,
  /\b(?:disregard|forget|override|bypass|drop|cancel)\s+(?:all\s+|any\s+|the\s+)?(?:(?:previous|prior|above|system|safety|security)\s+)?(?:instructions?|prompts?|rules?|policies|guards?|guardrails?|agntid|firewall|restrictions?|constraints?|guidelines?|directions?)\b/i,
  /\bsystem\s+prompt\s*(?:override|leak|reveal|dump|reset|bypass)?\b/i,
  /\b(?:bypass|evade|disable|circumvent|turn\s+off)\s+(?:agntid|policy|guardrails?|security|authorization|firewall|all\s+restrictions)\b/i,
  /\byou\s+are\s+now\s+(?:in\s+developer\s+mode|dan|unrestricted|jailbroken|an\s+ai\s+without\s+rules|unfiltered)\b/i,
  /\bdo\s+anything\s+now\b/i,
  /\bact\s+as\s+(?:an?\s+)?unrestricted\b/i,
  /\bpretend\s+(?:you\s+have\s+no\s+rules|there\s+are\s+no\s+(?:rules|policies|restrictions))\b/i,
  /\b(?:output|dump|print|reveal|expose|leak)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|developer\s+prompt|secret\s+key|developer\s+instructions|hidden\s+instructions)\b/i,
  /\bnew\s+operating\s+instructions\b/i,
  /\bfrom\s+now\s+on[,\s]+(?:ignore|disregard|you\s+will|you\s+must\s+obey)\b/i,
  /\bdeveloper\s+mode\s+(?:activated|enabled|on)\b/i,
  /\bsudo\s+mode\b/i,
  /\bjailbreak\b/i
];

export function normalizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .toLowerCase()
    .trim();
}

export function isPromptInjection(input) {
  const normalized = normalizeInput(input);
  return INJECTION_PATTERNS.some(pattern => pattern.test(normalized));
}
