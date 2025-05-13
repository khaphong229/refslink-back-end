/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *           example: 60d21b4667d0d8992e610c85
 *         name:
 *           type: string
 *           description: User's display name
 *           example: John Doe
 *         full_name:
 *           type: string
 *           description: User's full name
 *           example: John Edward Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john@example.com
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *           example: https://example.com/avatar.jpg
 *         status:
 *           type: string
 *           description: User account status
 *           enum: [active, inactive, pending]
 *           example: active
 *         googleId:
 *           type: string
 *           description: Google ID for OAuth authentication
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         success:
 *           type: boolean
 *           description: Success status of the response
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: Operation successful
 *         data:
 *           type: object
 *           description: Response data
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             expires_in:
 *               type: integer
 *               example: 3600
 *             token_type:
 *               type: string
 *               example: Bearer
 *             user:
 *               $ref: '#/components/schemas/User'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Bad request
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

// This file is only for Swagger documentation purposes and doesn't export anything 