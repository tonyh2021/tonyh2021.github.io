"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useStore } from "@/store";
import { MenuItem, MenuItemGroup } from "./MenuItem";
import {
  AboutMacIcon,
  AppStoreIcon,
  ForceQuitIcon,
  LockScreenIcon,
  LogOutIcon,
  RecentItemsIcon,
  RestartIcon,
  ShutDownIcon,
  SleepIcon,
  SystemPreferencesIcon,
} from "./AppleMenuIcons";
import { user } from "@/configs/user";

interface Props {
  logout: () => void;
  shutdown: () => void;
  restart: () => void;
  sleep: () => void;
  close: () => void;
  btnRef: React.RefObject<HTMLDivElement | null>;
}

export default function AppleMenu({ logout, shutdown, restart, sleep, close, btnRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, close, [btnRef]);
  const openWin = useStore((s) => s.openWin);

  return (
    <div ref={ref} className="menu-box menu-box-surface left-2 w-56">
      <MenuItemGroup>
        <MenuItem
          icon={<AboutMacIcon />}
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
        <MenuItem icon={<SystemPreferencesIcon />}>System Preferences…</MenuItem>
        <MenuItem icon={<AppStoreIcon />}>App Store…</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem icon={<RecentItemsIcon />}>Recent Items</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem icon={<ForceQuitIcon />}>Force Quit…</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup>
        <MenuItem icon={<SleepIcon />} onClick={sleep}>
          Sleep
        </MenuItem>
        <MenuItem icon={<RestartIcon />} onClick={restart}>
          Restart…
        </MenuItem>
        <MenuItem icon={<ShutDownIcon />} onClick={shutdown}>
          Shut Down…
        </MenuItem>
      </MenuItemGroup>
      <MenuItemGroup border={false}>
        <MenuItem icon={<LockScreenIcon />} onClick={logout}>
          Lock Screen
        </MenuItem>
        <MenuItem icon={<LogOutIcon />} onClick={logout}>
          Log Out {user.name}…
        </MenuItem>
      </MenuItemGroup>
    </div>
  );
}
