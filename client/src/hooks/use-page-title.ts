import { useEffect } from "react";

function setMetaTag(property: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let meta = document.querySelector(selector);
  if (meta) {
    meta.setAttribute("content", content);
  } else {
    meta = document.createElement("meta");
    if (isProperty) {
      meta.setAttribute("property", property);
    } else {
      meta.setAttribute("name", property);
    }
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  }
}

export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:title", title, true);
      setMetaTag("og:description", description, true);
      setMetaTag("twitter:title", title, true);
      setMetaTag("twitter:description", description, true);
    }
  }, [title, description]);
}
