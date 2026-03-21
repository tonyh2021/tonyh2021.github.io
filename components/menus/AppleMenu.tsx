"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/store";
import { MenuItem, MenuItemGroup } from "./MenuItem";
import { user } from "@/configs/user";

interface Props {
  logout: () => void;
  shutdown: () => void;
  restart: () => void;
  sleep: () => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement>;
}

export default function AppleMenu({ logout, shutdown, restart, sleep, close, btnRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, close, [btnRef]);
  const openWin = useStore((s) => s.openWin);

  return (
    <div ref={ref} className="menu-box menu-box-surface left-2 w-56">
      <MenuItemGroup>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            openWin("about");
            close();
          }}
        >
          About This Mac
        </MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem>System Preferences…</MenuItem>
        <MenuItem>App Store…</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem>Recent Items</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem>Force Quit…</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem onClick={sleep}>Sleep</MenuItem>
        <MenuItem onClick={restart}>Restart…</MenuItem>
        <MenuItem onClick={shutdown}>Shut Down…</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup border={false}>
        <MenuItem onClick={logout}>Lock Screen</MenuItem>
        <MenuItem onClick={logout}>Log Out {user.name}…</MenuItem>
      </MenuItemGroup>
    </div>
  );
}
