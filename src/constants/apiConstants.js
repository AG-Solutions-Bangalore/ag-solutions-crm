export const LOGIN = {
  postLogin: "/panel-login",
  forgotpassword: "/panel-send-password",
};
export const PANEL_CHECK = {
  getPanelStatus: "/panel-check-status",
  getEnvStatus: "/panel-fetch-dotenv",
};
export const DASHBOARD_API = {
  list: "/dashboard",
};
export const NOTIFICATION_API = {
  list: "/notification",
  create: "/notification",
  byId: (id) => `/notification/${id}`,
  updateById: (id) => `/notification/${id}?_method=PUT`,
  updateStatus: (id) => `/notifications/${id}/status`,
};
export const EMPLOYEE_API = {  //refer this for employee
  list: "/member",
  create: "/member",
  byId: (id) => `/member/${id}`,
  updateById: (id) => `/member/${id}?_method=PUT`,
  updateStatus: (id) => `/members/${id}/status`,
};
export const ACTIVE_EMPLOYEE = {
  list: "/activeMember",
};
export const SITE_API = {
  list: "/site",
  create: "/site",
  byId: (id) => `/site/${id}`,
  updateById: (id) => `/site/${id}?_method=PUT`,
  updateStatus: (id) => `/sites/${id}/status`,
};
export const ACTIVE_SITE = {
  list: "/activeSite",
};
export const KM_API = {
  list: "/kmreading",
  create: "/kmreading",
  byId: (id) => `/kmreading/${id}`,
  updateById: (id) => `/kmreading/${id}?_method=PUT`,
  deleteById: (id) => `/kmreading/${id}`,
};
export const TRIP_API = {
  list: "/trip",
  create: "/trip",
  byId: (id) => `/trip/${id}`,
  updateById: (id) => `/trip/${id}?_method=PUT`,
  deleteById: (id) => `/trip/${id}`,
};


export const ENQUIRY_API = {
  list: "/enquiry",
  byId: (id) => `/enquiry/${id}`,
  deleteById: (id) => `/enquiry/${id}`,
  updateStatus: (id) => `/enquiry/${id}`,
};

export const CATEGORY_API = {
  list: "/category",
  byId: (id) => `/category/${id}`,
  updateStatus: (id) => `/categorys/${id}/status`,
  update: (id) => `/category/${id}`,
  updateById: (id) => `/category/${id}?_method=PUT`,
  deleteById: (id) => `/category/${id}`,
  create: `/category`,
};

export const PROJECT_API = {
  list: "/project",
  byId: (id) => `/project/${id}`,
  deleteById: (id) => `/project/${id}`,
  updateStatus: (id) => `/projects/${id}/status`,
  updateById: (id) => `/project/${id}?_method=PUT`,
  create: "/project",
  updateSort: (id) => `/projects/${id}/sort`,
};

export const CAMPAIGN_API = {
  list: "/campaign-visit",
  deleteById: (id) => `/campaign-visit/${id}`,
};
export const CAMPAING_API = CAMPAIGN_API;

export const GALLERYS_API = {
  list: "/gallery",
  create: "/gallery",
  byId: (id) => `/gallery/${id}`,
  deleteById: (id) => `/gallery/${id}`,
  updateById: (id) => `/gallery/${id}?_method=PUT`,
};


export const SPONSOR_API = {
  create: "/sponsor",
  byId: (id) => `/sponsor/${id}`,
  updateById: (id) => `/sponsor/${id}`,
  deleteById: (id) => `/sponsor/${id}`,
  list: "/sponsor",
};
export const SPONSAR_API = SPONSOR_API;

export const BLOG_LIST = {
  list: "/blog",
  updateStatus: (id) => `/blogs/${id}/status`,
  create: "/blog",
  updateById: (id) => `/blog/${id}?_method=PUT`,
  blogByID: (id) => `/blog/${id}`,
  byId: (id) => `/blog/${id}`,
  deleteById: (id) => `/blog/${id}`,
};
export const REPORT_API = {
  employee: "/employee-report",
  site: "/site-report",
  kmReading: "/kmreading-report",
  trip: "/trip-petrol-reimbursement-report",
  place: "/trip-petrol-place-report"
};

//old

export const PROFILE = {
  profile: "/panel-fetch-profile",
  updateprofile: "/panel-update-profile",
};
export const DASHBOARD = {
  list: "/dashboard",
};
//for reference
export const BANNER_API = {
  list: "/banner",
  create: "/banner",
  byId: (id) => `/banner/${id}`,
  updateById: (id) => `/banner/${id}?_method=PUT`,
};
export const PURCHASE_PRODUCT_API = {
  list: "/purchase-product",
  byId: (id) => `/purchase-product/${id}`,
  updateById: (id) => `/purchase-product/${id}`,
  deleteSubById: (id) => `/purchase-product-sub/${id}`,
  deleteById: (id) => `/purchase-product/${id}`,
};
export const PURCHASE_COMPONENT_API = {
  list: "/purchase-component",
  byId: (id) => `/purchase-component/${id}`,
  updateById: (id) => `/purchase-component/${id}`,
  deleteSubById: (id) => `/purchase-component-sub/${id}`,
  deleteById: (id) => `/purchase-component/${id}`,
};
export const ORDERS_API = {
  list: "/order",
  byId: (id) => `/order/${id}`,
  updateById: (id) => `/order/${id}`,
  updateStatus: (id) => `/orders/${id}/status`,
  deleteSubProductById: (id) => `/order-sub/${id}`,
  deleteSubComponentById: (id) => `/order-sub1/${id}`,
  deleteById: (id) => `/order/${id}`,
};
export const PRODUCTION_API = {
  list: "/production",
  byId: (id) => `/production/${id}`,
  updateById: (id) => `/production/${id}`,
  deleteById: (id) => `/production/${id}`,
  deleteSubById: (id) => `/production-sub/${id}`,
  updateStatus: (id) => `/productions/${id}/status`,
};

export const COMPANY_API = {
  list: "/company",
  create: "/company",
  dropdown: "/companys",
  byId: (id) => `/company/${id}`,
  updateById: (id) => `/company/${id}?_method=PUT`,
};
export const FAQ_API = {
  list: "/faq",
  create: "/faq",
  byId: (id) => `/faq/${id}`,
  updateById: (id) => `/faq/${id}?_method=PUT`,
  deleteFaq: (id) => `/faq/${id}`,
  deleteById: (id) => `/faq/${id}`,
  deleteSub: (id) => `/faq-sub/${id}`,
  updateStatus: (id) => `/faqs/${id}/status`,
};
export const BLOG_API = {
  list: "/blog",
  create: "/blog",
  dropdown: "/blogs",
  byId: (id) => `/blog/${id}`,
  delete: (id) => `/blog/${id}`,
  deleteSub: (id) => `/blog-sub/${id}`,
  deleteRelated: (id) => `/blog-related/${id}`,
  updateById: (id) => `/blog/${id}?_method=PUT`,
};
export const GALLERY_API = {
  list: "/gallery",
  create: "/gallery",
  dropdown: "/gallerys",
  byId: (id) => `/gallery/${id}`,
  delete: (id) => `/gallery/${id}`,
  deleteById: (id) => `/gallery/${id}`,
  updateById: (id) => `/gallery/${id}?_method=PUT`,
};
export const PAGE_TWO_API = {
  dropdown: "/pageTwo",
};
export const CHANGE_PASSWORD_API = {
  create: "/panel-change-password",
};
export const COUNTRY_API = {
  list: "/country",
  dropdown: "/countrys",
  byId: (id) => `/country/${id}`,
};
export const LETUREYOUTUBE_API = {
  list: "/lecture-youtube",
  byId: (id) => `/lecture-youtube/${id}`,
  updateById: (id) => `/lecture-youtube/${id}?_method=POST`,
  updateById: (id) => `/lecture-youtube/${id}?_method=PUT`,
};

export const COURSE_API = {
  courses: "/courses",
};
export const GALLERYAPI = {
  gallery: "/gallery",
  byId: (id) => `/gallery/${id}`,
  updateById: (id) => `/gallery/${id}?_method=PUT`,
};
export const YOUTUBEFOR_API = {
  list: "/youtubeFor",
};
export const NEWSLETTER_API = {
  list: "/newsletter",
  deleteById: (id) =>`/newsletter/${id}`
};
export const STUDENT_API = {
  list: "/student",
  byId: (id) => `/student/${id}`,
  updateById: (id) => `/student/${id}?_method=PUT`,
};
