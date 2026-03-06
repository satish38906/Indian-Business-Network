// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://business-network-prod.ap-south-1.elasticbeanstalk.com', // Update with your EB URL
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
    },
    DASHBOARD: '/api/dashboard',
    REFERRALS: '/api/referrals',
    CHAPTERS: '/api/chapters',
    MEETINGS: '/api/meetings',
    MEMBERS: {
      MY_DATA: '/api/members/me/data',
      BY_CHAPTER: '/api/members',
      BY_ID: '/api/members/detail',
    },
    PROFILE: '/api/profile',
    LEADERSHIP: '/api/leadership',
  },
};

// Helper function to build full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
