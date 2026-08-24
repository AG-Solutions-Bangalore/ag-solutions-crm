const DEFAULT_IMAGE_BASE_URLS = {
  sponsor: "https://ag-solutions.in/webapi/public/assets/images/sponsors_images/",
  sponsors: "https://ag-solutions.in/webapi/public/assets/images/sponsors_images/",
  blog: "https://ag-solutions.in/webapi/public/assets/images/blog_images/",
  blogs: "https://ag-solutions.in/webapi/public/assets/images/blog_images/",
  gallery: "https://ag-solutions.in/webapi/public/assets/images/gallerys_images/",
  gallerys: "https://ag-solutions.in/webapi/public/assets/images/gallerys_images/",
  gallerys_images: "https://ag-solutions.in/webapi/public/assets/images/gallerys_images/",
  "link-gallery": "https://ag-solutions.in/webapi/public/assets/images/gallerys_images/",
  linkgallery: "https://ag-solutions.in/webapi/public/assets/images/gallerys_images/",
  project: "https://ag-solutions.in/webapi/public/assets/images/project_images/",

  projects: "https://ag-solutions.in/webapi/public/assets/images/project_images/",
  company: "https://ag-solutions.in/webapi/public/assets/images/company_images/",
};

export const getImageBaseUrl = (imageUrlArray = [], imageFor = "") => {
  if (Array.isArray(imageUrlArray) && imageUrlArray.length > 0) {
    const target = String(imageFor).trim().toLowerCase().replace(/[-_\s]/g, "");
    const found = imageUrlArray.find((i) => {
      if (!i?.image_for) return false;
      const cur = String(i.image_for).trim().toLowerCase().replace(/[-_\s]/g, "");
      return cur === target || cur.includes(target) || target.includes(cur);
    });
    if (found?.image_url) {
      const url = found.image_url;
      return url.endsWith("/") ? url : `${url}/`;
    }
  }

  const normalized = String(imageFor).trim().toLowerCase();
  const fallback =
    DEFAULT_IMAGE_BASE_URLS[normalized] ||
    DEFAULT_IMAGE_BASE_URLS[normalized.replace(/[-_\s]/g, "")];
  if (fallback) return fallback;

  return "https://ag-solutions.in/webapi/public/assets/images/";
};

export const getNoImageUrl = (imageUrlArray = []) => {
  if (Array.isArray(imageUrlArray) && imageUrlArray.length > 0) {
    const found = imageUrlArray.find((i) => {
      const name = String(i?.image_for || "").toLowerCase().replace(/[-_\s]/g, "");
      return name === "noimage";
    });
    if (found?.image_url) return found.image_url;
  }
  return "https://ag-solutions.in/webapi/public/assets/images/no_image.jpg";
};
