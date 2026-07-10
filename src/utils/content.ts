import { getCollection } from "astro:content";

const contentFiles = import.meta.glob("../content/**/*.md");
const contentPaths = Object.keys(contentFiles);

export function collectionHasFiles(key: string) {
  return contentPaths.some((path) => path.includes(`/content/${key}/`));
}

export async function safeGetCollection(key: string) {
  if (!collectionHasFiles(key)) return [] as any[];

  try {
    return await getCollection(key as any);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("does not exist or is empty")) return [] as any[];
    throw error;
  }
}
