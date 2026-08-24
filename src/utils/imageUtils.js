const DEFAULT_IMAGE_BASE_URLS = {
  sponsor: "https://ag-solutions.in/webapi/public/assets/images/sponsors_images/",
  sponsors: "https://ag-solutions.in/webapi/public/assets/images/sponsors_images/",
  blog: "https://ag-solutions.in/webapi/public/assets/images/blog_images/",
  blogs: "https://ag-solutions.in/webapi/public/assets/images/blog_images/",
  gallery: "https://ag-solutions.in/webapi/public/assets/images/gallery_images/",
  "link-gallery": "https://ag-solutions.in/webapi/public/assets/images/gallery_images/",
  project: "https://ag-solutions.in/webapi/public/assets/images/project_images/",
  projects: "https://ag-solutions.in/webapi/public/assets/images/project_images/",
  company: "https://ag-solutions.in/webapi/public/assets/images/company_images/",
};

export const getImageBaseUrl = (imageUrlArray = [], imageFor = "") => {
  if (Array.isArray(imageUrlArray) && imageUrlArray.length > 0) {
    const target = String(imageFor).trim().toLowerCase();
    const found = imageUrlArray.find(
      (i) =>
        i?.image_for &&
        String(i.image_for).trim().toLowerCase() === target
    );
    if (found?.image_url) {
      const url = found.image_url;
      return url.endsWith("/") ? url : `${url}/`;
    }
  }

  const normalized = String(imageFor).trim().toLowerCase();
  const fallback = DEFAULT_IMAGE_BASE_URLS[normalized];
  if (fallback) return fallback;

  return "https://ag-solutions.in/webapi/public/assets/images/";
};

export const getNoImageUrl = (imageUrlArray = []) => {
  if (Array.isArray(imageUrlArray) && imageUrlArray.length > 0) {
    const found = imageUrlArray.find((i) => {
      const name = String(i?.image_for || "").toLowerCase();
      return name === "no image" || name === "noimage" || name === "no_image";
    });
    if (found?.image_url) return found.image_url;
  }
  return "https://ag-solutions.in/webapi/public/assets/images/no_image.png";
};

