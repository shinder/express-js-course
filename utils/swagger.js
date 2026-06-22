// utils/swagger.js - 以 swagger-jsdoc 從路由的 @openapi 註解編譯出 OpenAPI 規格
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '通訊錄 API',
      version: '1.0.0',
      description:
        'Express 教學專案的 JSON API 文件。支援 Session（Cookie）與 JWT（Bearer Token）兩種認證。',
    },
    servers: [{ url: 'http://localhost:3000', description: '本機開發伺服器' }],
    tags: [
      { name: '認證', description: '登入、登出、JWT' },
      { name: '通訊錄', description: '通訊錄 CRUD 與收藏' },
    ],
    components: {
      securitySchemes: {
        // JWT：在 Authorization 標頭帶 Bearer <token>
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        // Session：登入後由 express-session 發出的 cookie
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'connect.sid' },
      },
      schemas: {
        AddressBookItem: {
          type: 'object',
          properties: {
            ab_id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '李小明' },
            email: { type: 'string', format: 'email', example: 'ming@example.com' },
            mobile: { type: 'string', example: '0912345678' },
            birthday: { type: 'string', format: 'date', example: '1995-10-02', nullable: true },
            address: { type: 'string', example: '台南市東區' },
            created_at: { type: 'string', format: 'date-time' },
            like_id: { type: 'integer', nullable: true, description: '目前會員是否收藏（null 表未收藏）' },
          },
        },
        ListResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            totalRows: { type: 'integer' },
            totalPages: { type: 'integer' },
            page: { type: 'integer' },
            perPage: { type: 'integer' },
            rows: { type: 'array', items: { $ref: '#/components/schemas/AddressBookItem' } },
          },
        },
        ZodIssue: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '姓名至少兩個字' },
            path: { type: 'array', items: { type: 'string' }, example: ['name'] },
          },
        },
      },
    },
  },
  // 從這些檔案的 @openapi 註解蒐集路由文件
  apis: ['./index.js', './routes/address-book.js'],
};

export default swaggerJSDoc(options);
