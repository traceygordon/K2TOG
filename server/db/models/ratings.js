//ratings models

const client = require("../config/db");

// 📤 Read / Retrieve
// getRatingById(ratingId)
// Fetch a single rating by its ID
// getRatingsForUser(userId)
// All ratings received by a user (either as buyer or seller)
// getRatingsByReviewer(reviewerId)
// All ratings given by a specific user
// getUserRatingForOrder(reviewerId, revieweeId, orderId)
// Check if a review already exists between two users for a specific order
// getAverageRatingForUser(userId)
// Get a user's average rating score (1–5 stars)

// ✏️ Update
// updateRating(ratingId, updateData)
// (Optional, if you allow users to edit reviews)

// ❌ Delete
// deleteRating(ratingId)
// Delete a rating (if needed — e.g., admin panel or user undo)

// 🧠 Extra Notes
// You might want to include a role field in the query filter (buyer vs seller) if ratings are grouped by type.
// You could also create helper functions like:
// hasUserRatedOrder(reviewerId, orderId)
// getRatingStats(userId) – to return count of reviews, average, breakdown, etc.