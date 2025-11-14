# Add Property Feature with Image Upload & Compression

## Overview
This feature allows authenticated users to add properties to the platform with automatic image compression and optimization. Images larger than 2MB are automatically compressed while maintaining quality.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Multer, Sharp
- **Frontend**: Vue.js, Tailwind CSS
- **Image Processing**: Sharp (WebP format with mozjpeg compression)

## Features Implemented

### Backend Features
1. **Image Upload & Compression**
   - Multer middleware for handling multipart/form-data
   - Sharp library for image compression and optimization
   - Automatic compression for images > 2MB
   - WebP format for optimal file size
   - Base64 encoding for MongoDB storage

2. **API Endpoints**
   - `POST /api/properties` - Create property with images
   - `PUT /api/properties/:id` - Update property with new images
   - `POST /api/properties/:id/images` - Add images to existing property
   - `DELETE /api/properties/:id/images/:imageIndex` - Delete specific image
   - `GET /api/properties/user/my-properties` - Get user's properties
   - `GET /api/properties/search` - Search properties

3. **Validation**
   - Server-side validation using express-validator
   - File type validation (JPEG, PNG, WebP only)
   - File size limits (10MB max per file, compressed to 2MB)
   - Maximum 10 images per property

4. **Security**
   - JWT authentication required for all write operations
   - User authorization checks
   - Image file type validation
   - Size limit enforcement

### Frontend Features
1. **Multi-Step Form**
   - 5-step wizard for easy property submission
   - Step 1: Basic Information (title, description, type)
   - Step 2: Property Details (bedrooms, bathrooms, area, price)
   - Step 3: Location (address, coordinates)
   - Step 4: Amenities (checklist)
   - Step 5: Image Upload

2. **Image Upload Component**
   - Drag & drop functionality
   - Multiple file selection
   - Image preview with thumbnails
   - Remove images before upload
   - File size display
   - Visual feedback and validation

3. **Success Page**
   - Property submission confirmation
   - Property details preview
   - Share functionality (WhatsApp, Facebook, Copy link)
   - Quick actions (View, Add Another, Dashboard)

4. **Mobile-First Design**
   - Responsive layout for all screen sizes
   - Touch-friendly interface
   - Optimized for Capacitor mobile apps

## File Structure

### Backend Files
```
metainflu/backend/
├── utils/
│   └── imageUpload.js          # Image compression utility
├── middleware/
│   ├── upload.js               # Multer configuration
│   └── validation.js           # Property validation rules
├── controllers/
│   └── propertyController.js   # Enhanced with image processing
├── routes/
│   └── propertyRoutes.js       # Updated with image endpoints
└── models/
    └── Property.js             # Schema (no changes needed)
```

### Frontend Files
```
metainflu/frontend/client-app/src/
├── views/
│   ├── AddProperty.vue         # Multi-step property form
│   └── PropertySuccess.vue     # Success confirmation page
├── components/
│   └── PropertyImageUpload.vue # Drag & drop image upload
└── services/
    └── propertyService.js      # API service methods
```

## Installation & Setup

### 1. Install Backend Dependencies
```bash
cd metainflu/backend
npm install sharp uuid
```

### 2. Environment Variables
No additional environment variables required. Uses existing MongoDB connection.

### 3. Run Backend Server
```bash
cd metainflu/backend
node server.js
```

### 4. Run Frontend Development Server
```bash
cd metainflu/frontend/client-app
npm run dev
```

## API Usage Examples

### Create Property with Images
```javascript
const formData = new FormData();
formData.append('title', 'Beautiful 3BHK Apartment');
formData.append('description', 'Spacious apartment with modern amenities');
formData.append('propertyType', 'apartment');
formData.append('bedrooms', 3);
formData.append('bathrooms', 2);
formData.append('area', 1500);
formData.append('price', 5000000);
formData.append('address', '123 Main Street, New Delhi');
formData.append('amenities', JSON.stringify(['Parking', 'Gym', 'Security']));

// Add images
images.forEach(image => {
  formData.append('images', image);
});

// POST request
fetch('http://localhost:5000/api/properties', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

### Upload Additional Images
```javascript
const formData = new FormData();
images.forEach(image => {
  formData.append('images', image);
});

fetch('http://localhost:5000/api/properties/PROPERTY_ID/images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

## Image Compression Details

### Compression Algorithm
1. **Initial Check**: Check if image size > 2MB
2. **Format Conversion**: Convert to WebP format
3. **Quality Reduction**: Start at 80% quality, reduce by 10% until size < 2MB
4. **Resize if Needed**: If still too large, resize dimensions proportionally
5. **Base64 Encoding**: Convert to base64 string for MongoDB storage

### Compression Stats Example
```javascript
{
  success: true,
  data: "data:image/webp;base64,...",
  size: 1.8MB,
  originalSize: 5.2MB,
  compressionRatio: "65.38%",
  format: "webp",
  width: 1920,
  height: 1080
}
```

## Validation Rules

### Property Fields
- **Title**: 5-100 characters
- **Description**: 20-1000 characters
- **Price**: Positive number
- **Address**: Minimum 10 characters
- **Property Type**: apartment | house | land | commercial
- **Bedrooms**: Non-negative integer
- **Bathrooms**: Non-negative number
- **Area**: Positive number
- **Latitude**: -90 to 90 (optional)
- **Longitude**: -180 to 180 (optional)
- **Amenities**: Array (optional)
- **Images**: Max 10, each < 10MB

## Error Handling

### Backend Errors
- `400`: Invalid input data
- `401`: Unauthorized (no token)
- `403`: Forbidden (not property owner)
- `404`: Property not found
- `500`: Server error

### Frontend Error Messages
- File type validation
- File size validation
- Maximum images validation
- Network error handling
- Form validation feedback

## Testing Checklist

### Backend Testing
- [ ] Create property with images < 2MB
- [ ] Create property with images > 2MB (should compress)
- [ ] Upload maximum 10 images
- [ ] Attempt to upload 11th image (should fail)
- [ ] Upload invalid file type (should fail)
- [ ] Upload without authentication (should fail)
- [ ] Update property owned by another user (should fail)
- [ ] Delete specific image from property
- [ ] Get user's properties

### Frontend Testing
- [ ] Multi-step form navigation
- [ ] Form validation on each step
- [ ] Drag & drop image upload
- [ ] Multiple image selection
- [ ] Image preview functionality
- [ ] Remove image before upload
- [ ] Submit form with all fields
- [ ] Submit form with optional fields empty
- [ ] Mobile responsive design
- [ ] Success page display
- [ ] Share functionality

## Performance Considerations

1. **Image Compression**: 
   - Average compression time: 200-500ms per image
   - Parallel processing not implemented (sequential)

2. **Base64 Storage**:
   - Increases database size by ~33%
   - Faster retrieval (no file system access)
   - BSON 16MB document limit applies

3. **Alternative: GridFS**:
   - For very large images or many properties
   - Consider implementing GridFS for production

## Future Enhancements

1. **Image Features**
   - Image cropping/editing
   - Set featured image
   - Reorder images via drag & drop
   - Watermark support

2. **Property Features**
   - Property draft saving
   - Scheduled publishing
   - Property templates
   - Bulk upload

3. **Performance**
   - CDN integration for images
   - Lazy loading
   - Progressive image loading
   - GridFS for large-scale storage

4. **UI/UX**
   - Map integration for location
   - Address autocomplete
   - Virtual tour upload
   - 360° image support

## Troubleshooting

### Issue: Images not compressing
**Solution**: Check Sharp installation. Run `npm rebuild sharp`

### Issue: Upload fails with large files
**Solution**: Check multer file size limit in `middleware/upload.js`

### Issue: Base64 string too large for MongoDB
**Solution**: Implement GridFS or external storage (S3, Cloudinary)

### Issue: Frontend not showing images
**Solution**: Ensure base64 strings are properly decoded in Vue components

## Security Best Practices

1. Always validate file types on backend
2. Enforce file size limits
3. Sanitize user inputs
4. Use JWT authentication
5. Implement rate limiting for uploads
6. Add CSRF protection
7. Validate image content (not just extension)

## Contributing

When contributing to this feature:
1. Follow existing code style
2. Add proper error handling
3. Include JSDoc comments
4. Update this documentation
5. Add tests for new functionality

## License
Same as parent project

## Support
For issues or questions, create an issue in the GitHub repository.
