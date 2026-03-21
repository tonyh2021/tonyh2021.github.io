"use client";

import type { ReactNode } from "react";

export function MenuItem({
  onClick,
  children,
  icon,
}: {
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
  children: ReactNode;
  /** Optional leading icon (inline `<svg>` + `currentColor` recommended). */
  icon?: ReactNode;
}) {
  return (
    <li
      onClick={onClick}
      className="flex cursor-default items-center gap-2 rounded px-2.5 py-0.5 leading-6 select-none hover:bg-blue-500 hover:text-white"
    >
      {icon != null ? (
        <span className="flex shrink-0 items-center opacity-90">{icon}</span>
      ) : null}
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}

export function MenuItemGroup({
  border = true,
  children,
}: {
  border?: boolean;
  children: ReactNode;
}) {
  return (
    <ul
      className={`relative px-1 pt-1 ${
        border
          ? "after:mx-2 after:mt-1 after:block after:h-px after:bg-gray-300 dark:after:bg-gray-600"
          : "pb-1"
      }`}
    >
      {children}
    </ul>
  );
}
