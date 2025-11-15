# Backend Update Plan

This document outlines the plan to update the backend to meet the new property listing application requirements.

## 1. Files to be Removed

The following files are identified as unnecessary for the new property listing application and will be removed:

*   `metainflu/backend/controllers/addressController.js`
*   `metainflu/backend/middleware/validators/addressValidator.js`
*   `metainflu/backend/routes/addressRoutes.js`
*   `metainflu/backend/controllers/brandController.js`
*   `metainflu/backend/routes/brandRoutes.js`
*   `metainflu/backend/models/Brand.js`
*   `metainflu/backend/controllers/cartController.js`
*   `metainflu/backend/middleware/validators/cartValidator.js`
*   `metainflu/backend/routes/cartRoutes.js`
*   `metainflu/backend/models/Cart.js`
*   `metainflu/backend/controllers/categoryController.js`
*   `metainflu/backend/routes/categoryRoutes.js`
*   `metainflu/backend/models/Category.js`
*   `metainflu/backend/controllers/contentController.js`
*   `metainflu/backend/routes/contentRoutes.js`
*   `metainflu/backend/services/contentScheduler.js`
*   `metainflu/backend/controllers/dashboardController.js`
*   `metainflu/backend/routes/dashboardRoutes.js`
*   `metainflu/backend/controllers/geocodeController.js`
*   `metainflu/backend/routes/geocodeRoutes.js`
*   `metainflu/backend/controllers/homeController.js`
*   `metainflu/backend/routes/homeRoutes.js`
*   `metainflu/backend/controllers/orderController.js`
*   `metainflu/backend/middleware/validators/orderValidator.js`
*   `metainflu/backend/routes/orderRoutes.js`
*   `metainflu/backend/models/Order.js`
*   `metainflu/backend/controllers/parentCategoryController.js`
*   `metainflu/backend/routes/parentCategoryRoutes.js`
*   `metainflu/backend/models/ParentCategory.js`
*   `metainflu/backend/controllers/productController.js`
*   `metainflu/backend/middleware/validators/productValidator.js`
*   `metainflu/backend/routes/productRoutes.js`
*   `metainflu/backend/models/Product.js`
*   `metainflu/backend/controllers/subCategoryController.js`
*   `metainflu/backend/routes/subCategoryRoutes.js`
*   `metainflu/backend/models/SubCategory.js`
*   `metainflu/backend/controllers/vendorController.js`
*   `metainflu/backend/routes/vendorRoutes.js`
*   `metainflu/backend/routes/vendorBrandRoutes.js`
*   `metainflu/backend/controllers/wishlistController.js`
*   `metainflu/backend/routes/wishlistRoutes.js`
*   `metainflu/backend/models/Wishlist.js`
*   `metainflu/backend/models/FeaturedCollection.js`
*   `metainflu/backend/models/HeroBanner.js`
*   `metainflu/backend/models/ShippingInfo.js`
*   `metainflu/backend/routes/generalRoutes.js` (This file was not explicitly checked, but its name suggests it might contain general e-commerce routes)

## 2. Files to be Repurposed/Updated

The following files will be updated or repurposed to align with the new requirements:

*   `metainflu/backend/server.js`: Update route imports and `app.use` statements to reflect the removed routes.
*   `metainflu/backend/routes.map.js`: This file is no longer needed and should be manually removed.
*   `metainflu/backend/controllers/authController.js`: Ensure `registerUser` handles mobile and Aadhaar.
*   `metainflu/backend/middleware/validators/authValidator.js`: Update validation rules for mobile and Aadhaar.
*   `metainflu/backend/models/User.js`: Update user schema to include mobile and Aadhaar fields.
*   `metainflu/backend/controllers/propertyController.js`: Ensure all property-related logic (create, get, update, delete, upload images) is correctly implemented.
*   `metainflu/backend/models/Property.js`: Define the schema for properties, including fields for images, location, etc.
*   `metainflu/backend/controllers/adminController.js`: Ensure `getAdminProperties`, `approveProperty`, and `rejectProperty` are correctly implemented.
*   `metainflu/backend/models/Favorite.js`: Ensure this model correctly links users to favorited properties.
*   `metainflu/backend/controllers/favoriteController.js`: Ensure `getFavorites`, `addFavorite`, `removeFavorite` are correctly implemented.
*   `metainflu/backend/models/Chat.js`: Define the schema for chat messages and conversations.
*   `metainflu/backend/controllers/chatController.js`: Ensure `startChat` and `getChatMessages` are correctly implemented.
*   `metainflu/backend/controllers/userController.js`: Ensure `getUserProfile` and `updateUserProfile` handle the new user schema.
*   `metainflu/backend/middleware/authMiddleware.js`: Ensure `protect` and `admin` middleware functions are robust.
*   `metainflu/backend/config/db.js`: (If exists and used) Ensure database connection is correctly configured.

## 3. New Files to be Created

No new route files are explicitly needed as existing ones cover the requirements. However, new models or helper files might be created as needed during implementation.

## 4. Phased Implementation Plan

1.  **Cleanup:** Remove all identified unnecessary files.
2.  **Model Updates:**
    *   Update `User.js` schema for mobile and Aadhaar.
    *   Create/Update `Property.js` schema with all necessary fields (images, location, etc.).
    *   Review and update `Favorite.js` and `Chat.js` schemas if needed.
3.  **Authentication & Authorization:**
    *   Refine `authController.js` and `authValidator.js` for mobile/Aadhaar registration and OTP login.
    *   Ensure `authMiddleware.js` is robust.
4.  **Property Management:**
    *   Implement/refine `propertyController.js` for all property-related operations (CRUD, image upload).
    *   Ensure `adminController.js` handles property approval/rejection.
5.  **Favorites & Chat:**
    *   Implement/refine `favoriteController.js` and `chatController.js`.
6.  **Server Configuration:**
    *   Update `server.js` to remove references to deleted routes and ensure all remaining routes are correctly mounted.
7.  **Testing:** Implement unit and integration tests for all new and modified functionalities.
