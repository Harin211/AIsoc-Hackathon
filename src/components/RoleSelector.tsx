"use client";

import type { Role } from "@/lib/types";

const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: "engineering", label: "Engineer", hint: "constraints first" },
  { id: "marketing", label: "Marketer / PM", hint: "launch impact" },
  { id: "executive", label: "Executive", hint: "30-second altitude" },
];

export function RoleSelector({
  value,
  onChange,
}: {
  value: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="role-selector" role="radiogroup" aria-label="Reader role">
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          role="radio"
          aria-checked={value === role.id}
          className={value === role.id ? "role-btn active" : "role-btn"}
          onClick={() => onChange(role.id)}
        >
          <span>{role.label}</span>
          <small>{role.hint}</small>
        </button>
      ))}
    </div>
  );
}
