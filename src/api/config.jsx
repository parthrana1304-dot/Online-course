
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
  SEND_OTP : `${API_BASE}/api/send-otp/`,
  VERIFY_OTP : `${API_BASE}/api/verify-otp/`,
  SEND_RECOVERY_EMAIL: `${API_BASE}/api/send-recovery-email/`,

  // function because uid & token are dynamic
  RESET_PASSWORD: (uid, token) =>
    `${API_BASE}/api/reset-password/${uid}/${token}/`,
  
  PROGRESS: `${API_BASE}/api/progress/`,

  //WISHLIST
  WISHLIST_LIST: `${API_BASE}/api/wishlistview/`,
  WISHLIST_TOGGLE:(courseId) => `${API_BASE}/api/toggle/${courseId}/`,
  WISHLIST_CHECK: (courseId) => `${API_BASE}/api/check/${courseId}/`,

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

  LESSON_SAVE_PROGRESS: `${API_BASE}/api/lesson-progress/save/`,
  LESSON_PROGRESS: (courseId) => `${API_BASE}/api/lesson-progress/${courseId}/`,
  LAST_WATCHED_LESSON: (courseId) => `${API_BASE}/api/course/last-watched/${courseId}/`,
  
  COURSE_LESSONS_RESOURCES: (id) => `${API_BASE}/api/course/${id}/resources/`,
  RESOURCE_DOWNLOAD: (id) => `${API_BASE}/api/resource/${id}/download/`,

  START_EXAM: (courseId) => `${API_BASE}/api/exams/access/${courseId}/`,
  SUBMIT_EXAM: `${API_BASE}/api/exams/submit/`,

  COURSE_PROGRESS_STATUS: (courseId) => `${API_BASE}/api/course-progress/${courseId}/`,
  LESSON_COMPLETED : `${API_BASE}/api/lesson-complete/`,
  
  GENERATE_CERTIFICATE: (courseId) => `${API_BASE}/api/generate-certificate/${courseId}/`
  

};  
