import { useEffect } from "react";

/**
 * Sets the document title and meta description for the current page and
 * restores the previous values when the page unmounts.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description === undefined) {
      return () => {
        document.title = previousTitle;
      };
    }

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const descriptionMeta = meta;
    const previousDescription = descriptionMeta.content;
    descriptionMeta.content = description;

    return () => {
      document.title = previousTitle;
      descriptionMeta.content = previousDescription;
    };
  }, [title, description]);
}
