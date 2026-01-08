
export const API_BASE = "http://127.0.0.1:8000";

export const API = {
  CATEGORIES: `${API_BASE}/api/categories/`,
  COURSES: `${API_BASE}/api/courses/`,
  COURSE_BY_ID: (id) => `${API_BASE}/api/courses/${id}/`,

  // 🔥 Dynamic enrollment check API
  ENROLL_CHECK: (id) => `${API_BASE}/api/enrollments/check/${id}/`,
  // 🔥 Enroll API
  ENROLL: `${API_BASE}/api/enrollments/`,
  ENROLL_CREATE: `${API_BASE}/enrollments/create/`,


  //AUTH
  LOGIN : `${API_BASE}/api/login/`,
  SIGNUP: `${API_BASE}/api/signup/`,
  GOOGLE_LOGIN: `${API_BASE}/api/auth/google/`, // Google OAuth endpoint


  //WISHLIST
  WISHLIST_LIST: `${API_BASE}/api/wishlistview/`,
  WISHLIST_TOGGLE: `${API_BASE}/api/toggle/`,
  WISHLIST_CHECK: (id) => `${API_BASE}/api/check/${id}/`,

  //REVIEWS
  COURSE_REVIEWS: (id) => `${API_BASE}/api/courses/${id}/reviews/`,
  SUBMIT_REVIEWS : (id) => `${API_BASE}/api/courses/${id}/reviews/submit/`,

  //COUPON
  APPLY_COUPON : `${API_BASE}/api/apply-coupon/`,
  ACTIVE_COUPON : `${API_BASE}/api/coupons/active/`,
  APPLY_VALID_COUPON : `${API_BASE}/api/coupons/validate/`,

  SUBSCRIPTION_CREATE_ORDER :(PlanId) => `${API_BASE}/api/subscriptions/${PlanId}/create_order/`,
  SUBSCRIPTION : `${API_BASE}/api/subscriptions/`,
  VERIFY_SUBSCRIPTION_PAYMENT : `${API_BASE}/api/subscriptions/verify_Subscription_payment/`,
  
  VERIFY_PAYMENT : `${API_BASE}/api/enrollment/verify_payment/`,
  CREATE_ORDER : `${API_BASE}/api/enrollment/create-order/`,
};  
