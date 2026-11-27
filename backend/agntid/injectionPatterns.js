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
  /\bjailbreak\b/i,

  // Direct rule relaxation & override patterns
  /\b(?:set\s+aside|stop\s+following|no\s+longer\s+bound\s+by)\s+(?:all\s+|any\s+|the\s+)?(?:(?:previous|prior|above|system|shop|existing|safety)\s+)?(?:instructions?|rules?|polic(?:y|ies)|guidelines?|safety)\b/i,
  /\bact\s+as\s+(?:the\s+)?(?:shop\s+)?(?:owner|admin(?:istrator)?)\b.*?\bwithout\s+(?:asking|prompting|confirming|permission)\b/i,
  /(?:^|\n)\s*system\s*:\s*/i,

  // Indirect phrasing & prompt exfiltration patterns
  /\b(?:repeat|reproduce|quote|what\s+were)\s+(?:the\s+)?(?:exact\s+)?(?:instructions?|text|words?|prompt)\s+(?:that\s+were\s+)?(?:provided|given|written)?(?:\s+to\s+you)?\s*(?:at\s+the\s+beginning|before|above)\b/i,
  /\b(?:disregard|ignore)\s+what\s+(?:the\s+)?(?:shop\s+)?(?:owner|developer|user|system)\s+(?:configured|told\s+you|said|set)\b/i,
  /\b(?:all\s+)?(?:safety\s+guards?|guardrails?|security\s+checks?|safety\s+firewall)(?:\s+(?:are|were|is|has\s+been))?\s+(?:dropped|disabled|bypassed|turned\s+off)\b/i,
  /\b(?:print|reveal|output|show|dump)\s+(?:the\s+)?(?:hidden\s+)?(?:developer\s+context|operational\s+boundaries|internal\s+instructions)\b/i,
  /\btreat\s+(?:previous\s+|prior\s+|all\s+)?(?:shop\s+)?rules\s+as\s+(?:null|void|invalid|ignored)\b/i,

  // Indirect third-party injection rule (invoice/note/email addressing assistant with imperatives)
  /\b(?:(?:note|memo|email|invoice|instruction|message)\s*(?:to|for)?\s*[:,]?\s*(?:assistant|ai|bot)|dear\s+(?:assistant|ai|bot)|(?:assistant|ai|bot)\s*[:,])\b.*?\b(?:(?:update|change|redirect|set|transfer|send|modify|replace)\b.*?\b(?:bank|account|ifsc|payout|settlement|upi)|(?:process|issue|approve|send|execute)\b.*?\brefunds?|(?:do\s+not|don'?t|never)\s+(?:tell|inform|alert|notify|mention\s+to)\s+(?:the\s+)?(?:owner|merchant|admin)|hide\s+(?:this\s+)?from\s+(?:the\s+)?(?:owner|merchant|admin))\b/is,

  // Secrecy imperatives ("do not tell the owner", "hide this from owner")
  /\b(?:do\s+not|don'?t|never)\s+(?:tell|inform|alert|notify|mention\s+to)\s+(?:the\s+)?(?:shop\s+)?(?:owner|merchant|admin)\b/i,
  /\bhide\s+(?:this\s+)?from\s+(?:the\s+)?(?:shop\s+)?(?:owner|merchant|admin)\b/i,
  /\b(?:shop\s+)?owner\s+ko\s+(?:bina\s+bataye|mat\s+batao|nahi\s+batana)\b/i,
  /(?:ಮಾಲೀಕರಿಗೆ|owner\s*ge)\s+(?:ತಿಳಿಸದೆ|thilisade|helade)/ui,

  // Hinglish adversarial injection patterns
  /\b(?:pichhle|purane|sabhi|saare)\s+(?:saare\s+|sab\s+)?(?:instructions?|rules?|niyam|directions?)\s+(?:bhool\s+jao|ignore\s+karo|radd\s+karo|chhod\s+do)\b/i,
  /\b(?:sab\s+|sabhi\s+)?(?:rules?|niyam|instructions?)\s+ignore\s+karo\b/i,
  /\b(?:agntid|security|firewall|safety)\s*(?:guard)?\s+(?:band\s+karo|disable\s+karo|hatao)\b/i,
  /\b(?:system\s+prompt|secret\s+instructions?)\s+(?:dikhao|leak\s+karo|batao)\b/i,
  /\b(?:ab\s+se\s+tum|bina\s+kisi\s+restrictions?)\s+(?:bina\s+kisi\s+restrictions?|ke\s+kaam\s+karoge)\b/i,
  /\bpurane\s+directions\s+radd\s+karo\b/i,
  /\b(?:agntid\s+firewall|security\s+firewall)\s+ko\s+bypass\s+karke\b/i,

  // Kannada injection patterns (Unicode script + transliterated)
  /(?:ಹಿಂದಿನ|ಹಳೆಯ)\s+(?:ಎಲ್ಲಾ\s+)?(?:ನಿಯಮಗಳನ್ನು|ಸೂಚನೆಗಳನ್ನು)\s+(?:ನಿರ್ಲಕ್ಷಿಸಿ|ಮರೆತುಬಿಡಿ)/u,
  /(?:ಸಿಸ್ಟಮ್\s+ಪ್ರಾಂಪ್ಟ್|ಆರಂಭಿಕ\s+ಸೂಚನೆಗಳನ್ನು)\s+(?:ತೋರಿಸಿ|ಹೊರಹಾಕಿ)/u,
  /\b(?:haleya|hindina|ellaa)\s+(?:niyamagalannu|nirdeshanagalannu)\s+(?:mareyiri|nirlakshisi|bittubidi)\b/i,
  /\b(?:system\s+prompt|secret\s+keys?)\s+(?:leak\s+maadu|kodi)\b/i,
  /\bagntid\s+(?:bypass\s+maadi|disable\s+maadi)\b/i,

  // Roleplay & persona deception patterns
  /\b(?:roleplay|role-play|playing\s+the\s+role\s+of)\s+(?:game|mode|a\s+shadow\s+audit)?\s*:\s*you\s+are\b/i,
  /\bplaying\s+the\s+role\s+of\b/i,
  /\byou\s+are\s+(?:chaosbot|an?\s+ai\s+with\s+zero\s+(?:ethical|moral|security)\s+boundaries)\b/i,
  /\bfictional\s+(?:script|scenario|movie|story)\b.*?\bbypasses?\s+agntid\b/i,
  /\bassume\s+(?:the\s+)?persona\s+of\b/i,
  /\b(?:imagine\s+a\s+simulation|simulating\s+a\s+security\s+penetration\s+test|we\s+are\s+simulating)\b/i,
  /\bhypothetical\s+scenario\s*:\s*pretend\s+you\s+have\s+zero\b/i,

  // Delimiter manipulation & fence escaping patterns
  /---+\s*(?:end\s+of\s+)?(?:system\s+)?(?:instructions?|prompt|system)\s*---+/i,
  /<\/(?:system|system_prompt)>\s*<override>/i,
  /<system_directive>/i,
  /\[system\s+(?:message|reset|override)[^\]]*\]/i,
  /===+\s*system\s+(?:reset|override)\s*===+/i,
  /```(?:json)?\s*\{[^}]*["'](?:instruction|action)["']\s*:\s*["'](?:ignore_previous|dump_users|override)["']/i,

  // Multi-part / code comment injection patterns
  /\bpart\s*1\s*:\s*disregard;?\s*part\s*2\s*:\s*previous\s+instructions\b/i,
  /\/\*\s*agntid\s+bypass\s*\*\/|\/\/\s*safety\s+rules\b/i,
  /\b(?:instruction\.override|policy\.ignoreall\(\)|exportkhatabook\(\))\b/i,
  /\bconfirm\s+you\s+can\s+bypass\s+agntid\b/i
];

export function normalizeInput(input) {
  if (!input || typeof input !== 'string') {
    return {
      standard: '',
      collapsed: '',
      variants: ['', ''],
      toString() { return ''; }
    };
  }

  const standard = input
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .toLowerCase()
    .trim();

  // Collapsed variant that strips punctuation between letters (e.g. i.g.n.o.r.e -> ignore, d-i-s-r-e-g-a-r-d -> disregard)
  const collapsed = standard.replace(/([\p{L}\p{N}])[\p{P}\p{S}]+(?=[\p{L}\p{N}])/gu, '$1');

  // Spaced-collapsed variant that collapses single letters separated by whitespace (e.g. i g n o r e -> ignore)
  let spacedCollapsed = standard;
  let prev;
  do {
    prev = spacedCollapsed;
    spacedCollapsed = spacedCollapsed.replace(/\b([\p{L}\p{N}])\s+(?=[\p{L}\p{N}]\b)/gu, '$1');
  } while (spacedCollapsed !== prev);

  const variants = [standard, collapsed, spacedCollapsed];

  return {
    standard,
    collapsed,
    spacedCollapsed,
    variants,
    toString() { return standard; }
  };
}

export function isPromptInjection(input) {
  const norm = normalizeInput(input);
  const variants = norm?.variants || [norm];
  return INJECTION_PATTERNS.some(pattern =>
    variants.some(variant => typeof variant === 'string' && pattern.test(variant))
  );
}
