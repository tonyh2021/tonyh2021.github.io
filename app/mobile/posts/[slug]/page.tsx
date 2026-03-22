import { getAllSlugs } from "@/lib/posts";
import MobilePostDetailClient from "@/components/mobile/MobilePostDetailClient";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function MobilePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MobilePostDetailClient slug={slug} />;
}
