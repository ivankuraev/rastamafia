// Book data is derived automatically from the assets folder, so adding a new
// book later is just dropping images into a subfolder of `src/assets/book/`.
//
// Conventions:
//   - A book = one subfolder, e.g. `src/assets/book/book-1/`
//   - Its images (= the Instagram-style post) live inside that folder and are
//     ordered by filename (e.g. book-1-1.jpg … book-2-3.jpg).
//   - Images placed directly in `src/assets/book/` (no subfolder) form a single
//     default book.
//   - Titles can be declared here; unknown folders fall back to their id.

type Book = {
  id: string;
  title: string;
  images: string[];
};

const modules = import.meta.glob("../assets/book/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const TITLES: Record<string, string> = {
  _default: "Книга",
  "book-1": "Книга I",
};

function buildBooks(): Book[] {
  const byFolder: Record<string, string[]> = {};
  for (const [path, url] of Object.entries(modules)) {
    const rel = path.replace("../assets/book/", "");
    const parts = rel.split("/");
    const folder = parts.length > 1 ? parts[0] : "_default";
    (byFolder[folder] ??= []).push(url);
  }
  return Object.entries(byFolder).map(([id, images]) => {
    images.sort();
    return { id, title: TITLES[id] ?? id, images };
  });
}

export const BOOKS = buildBooks();
