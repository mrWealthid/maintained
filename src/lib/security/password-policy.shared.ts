export const DEFAULT_PASSWORD_POLICY = {
  minLength: 8,
  expiryDays: 90,
  requireUppercase: false,
  requireNumbers: false,
  requireSpecial: false,
};

export type PasswordPolicy = typeof DEFAULT_PASSWORD_POLICY;

export type PasswordPolicyRequirement = {
  key: "length" | "uppercase" | "numbers" | "special";
  label: string;
  met: boolean;
};

export type PasswordStrengthAssessment = {
  score: number;
  label: "Too weak" | "Fair" | "Good" | "Strong";
  meetsPolicy: boolean;
  requirements: PasswordPolicyRequirement[];
  guidance: string;
};

function hasSpecialCharacter(value: string) {
  return /[^A-Za-z0-9]/.test(value);
}

function hasLowercaseCharacter(value: string) {
  return /[a-z]/.test(value);
}

export function buildPasswordPolicyRequirements(
  password: string,
  policy: PasswordPolicy,
): PasswordPolicyRequirement[] {
  const requirements: PasswordPolicyRequirement[] = [
    {
      key: "length",
      label: `At least ${policy.minLength} characters`,
      met: password.length >= policy.minLength,
    },
  ];

  if (policy.requireUppercase) {
    requirements.push({
      key: "uppercase",
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    });
  }

  if (policy.requireNumbers) {
    requirements.push({
      key: "numbers",
      label: "At least one number",
      met: /\d/.test(password),
    });
  }

  if (policy.requireSpecial) {
    requirements.push({
      key: "special",
      label: "At least one special character",
      met: hasSpecialCharacter(password),
    });
  }

  return requirements;
}

export function getPasswordPolicyValidationMessage(
  password: string,
  policy: PasswordPolicy,
) {
  const unmet = buildPasswordPolicyRequirements(password, policy).find(
    (requirement) => !requirement.met,
  );

  if (!unmet) {
    return null;
  }

  switch (unmet.key) {
    case "length":
      return `Password must be at least ${policy.minLength} characters long`;
    case "uppercase":
      return "Password must include at least one uppercase letter";
    case "numbers":
      return "Password must include at least one number";
    case "special":
      return "Password must include at least one special character";
    default:
      return unmet.label;
  }
}

export function assessPasswordStrength(
  password: string,
  policy: PasswordPolicy,
): PasswordStrengthAssessment {
  const requirements = buildPasswordPolicyRequirements(password, policy);
  const meetsPolicy = requirements.every((requirement) => requirement.met);
  const requiredMetCount = requirements.filter(
    (requirement) => requirement.met,
  ).length;
  const requiredScore =
    requirements.length > 0
      ? Math.round((requiredMetCount / requirements.length) * 70)
      : 0;

  const characterClassCount = [
    hasLowercaseCharacter(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    hasSpecialCharacter(password),
  ].filter(Boolean).length;

  const optionalChecks = [
    password.length >= Math.max(policy.minLength + 4, 12),
    characterClassCount >= 3,
    new Set(password).size >= 8,
  ];
  const optionalMetCount = optionalChecks.filter(Boolean).length;
  const optionalScore =
    optionalChecks.length > 0
      ? Math.round((optionalMetCount / optionalChecks.length) * 30)
      : 0;

  const score =
    password.length === 0 ? 0 : Math.min(100, requiredScore + optionalScore);

  let label: PasswordStrengthAssessment["label"] = "Too weak";
  if (meetsPolicy && score >= 85) {
    label = "Strong";
  } else if (meetsPolicy && score >= 65) {
    label = "Good";
  } else if (score >= 35) {
    label = "Fair";
  }

  let guidance = "Start with a password that matches your workspace policy.";
  if (password.length === 0) {
    guidance =
      "Start typing to see how your password matches the current policy.";
  } else if (!meetsPolicy) {
    const unmet = requirements.find((requirement) => !requirement.met);
    guidance = unmet
      ? `Add ${unmet.label.toLowerCase()} to meet the current policy.`
      : "Adjust the password until every required rule is satisfied.";
  } else if (label === "Strong") {
    guidance = "This password meets policy and has strong overall complexity.";
  } else {
    guidance =
      "This password meets policy. Add more length or a broader mix of characters to make it stronger.";
  }

  return {
    score,
    label,
    meetsPolicy,
    requirements,
    guidance,
  };
}
