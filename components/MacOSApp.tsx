"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Boot from "./Boot";
import Login from "./Login";
import MacDesktop from "./desktop/MacDesktop";
import type { Post } from "@/lib/types";

interface Props {
  posts: Post[];
  enPosts: Post[];
}

export default function MacOSApp({ posts, enPosts }: Props) {
  const { initDark, login, booting, sleeping, restarting, setBooting } = useStore(
    useShallow((s) => ({
      initDark: s.initDark,
      login: s.login,
      booting: s.booting,
      sleeping: s.sleeping,
      restarting: s.restarting,
      setBooting: s.setBooting,
    }))
  );

  useEffect(() => {
    initDark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {login ? (
        <MacDesktop posts={posts} enPosts={enPosts} />
      ) : (
        <Login />
      )}

      {/* Boot overlay */}
      <div
        className={`fixed inset-0 z-99999 transition-opacity duration-500 ${booting ? "" : "pointer-events-none"}`}
        style={{ opacity: booting ? 1 : 0 }}
      >
        {booting && (
          <Boot restart={restarting} sleep={sleeping} setBooting={setBooting} />
        )}
      </div>
    </>
  );
}
