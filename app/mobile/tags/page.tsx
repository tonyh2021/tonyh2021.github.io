import { getAllTags } from "@/lib/posts";
import Link from "next/link";
import MobileHeader from "@/components/mobile/MobileHeader";

export const metadata = {
  title: "Tags",
};

export default function MobileTagsPage() {
  const tagMap = getAllTags();
  const sortedTags = Object.keys(tagMap).sort();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <MobileHeader title="Tags" />
      <div className="flex flex-wrap">
        {sortedTags.map((tag) => (
          <div key={tag} className="mt-2 mr-5 mb-2">
            <Link
              href={`/mobile/tags/${encodeURIComponent(tag)}`}
              className="mr-3 text-sm font-medium text-blue-500 uppercase hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {tag}
            </Link>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              ({tagMap[tag].length})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
