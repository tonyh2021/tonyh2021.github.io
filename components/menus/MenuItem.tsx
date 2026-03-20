'use client';

import type { ReactNode } from 'react';

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
      className="leading-6 cursor-default px-2.5 rounded hover:text-white hover:bg-blue-500 select-none"
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
          ? 'after:block after:h-px after:mx-2 after:bg-gray-300 dark:after:bg-gray-600 after:mt-1'
          : 'pb-1'
      }`}
    >
      {children}
    </ul>
  );
}
