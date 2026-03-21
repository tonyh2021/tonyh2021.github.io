"use client";

import type { ReactNode } from "react";

export function MenuItem({
  onClick,
  children,
}: {
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
  children: ReactNode;
}) {
  return (
    <li
      onClick={onClick}
      className="cursor-default rounded px-2.5 leading-6 select-none hover:bg-blue-500 hover:text-white"
    >
      {children}
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
