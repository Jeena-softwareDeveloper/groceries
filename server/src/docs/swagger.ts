export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DistrictMart API',
    version: '1.0.0',
    description: 'Multi-vendor grocery marketplace API',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  paths: {
    '/api/v1/health': {
      get: { summary: 'Health check', tags: ['System'] },
    },
    '/api/v1/auth/customer/otp/request': {
      post: { summary: 'Request customer OTP', tags: ['Auth'] },
    },
    '/api/v1/auth/customer/otp/verify': {
      post: { summary: 'Verify customer OTP', tags: ['Auth'] },
    },
    '/api/v1/auth/vendor/login': {
      post: { summary: 'Vendor login', tags: ['Auth'] },
    },
    '/api/v1/auth/admin/login': {
      post: { summary: 'Super Admin login', tags: ['Auth'] },
    },
    '/api/v1/admin/districts': {
      get: { summary: 'List districts', tags: ['Admin'] },
      post: { summary: 'Create district', tags: ['Admin'] },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
