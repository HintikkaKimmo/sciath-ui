import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  draft?: boolean;
  readingTime: number;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  readingTime: number;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function showDrafts(): boolean {
  return process.env.SHOW_DRAFTS === "true";
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts: BlogPostMeta[] = [];

  for (const filename of files) {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = matter(raw);

    if (data.draft && !showDrafts()) continue;

    posts.push({
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      date: (data.date as string) ?? "",
      author: (data.author as string) ?? "Sciath Team",
      tags: (data.tags as string[]) ?? [],
      image: data.image as string | undefined,
      readingTime: estimateReadingTime(content),
    });
  }

  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return posts;
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: rawContent } = matter(raw);

  if (data.draft && !showDrafts()) return null;

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(rawContent);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "Sciath Team",
    tags: data.tags ?? [],
    image: data.image,
    draft: data.draft,
    readingTime: estimateReadingTime(rawContent),
    content: String(result),
  };
}
