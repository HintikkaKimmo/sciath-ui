import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Sciath",
  description:
    "Insights on CRA compliance, embedded Linux security, vulnerability management, and firmware supply chain protection.",
  openGraph: {
    title: "Blog | Sciath",
    description:
      "Insights on CRA compliance, embedded Linux security, and vulnerability management.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog | Sciath",
    description:
      "Insights on CRA compliance, embedded Linux security, and vulnerability management.",
  },
  alternates: {
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-serif text-4xl tracking-tight">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          CRA compliance, embedded Linux security, and vulnerability
          intelligence.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Inbox className="size-10 text-primary/30" />
          <p className="text-sm font-medium">No posts yet</p>
          <p className="text-xs text-muted-foreground">
            We&apos;re working on our first articles. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border-b border-border/50 pb-8 last:border-0"
            >
              <Link href={`/blog/${post.slug}`} className="block space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>{post.readingTime} min read</span>
                </div>
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <span className="ml-auto text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
