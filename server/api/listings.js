// Express Imports:
const express = require("express");
const apiRouter = express.Router();

// Function imports:
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require("../db/models/listings_models");

/** Basic CRUD Routes */
// Get all listings:
apiRouter.get("/", async (res, next) => {
  try {
    res.send(await getAllListings());
  } catch (ex) {
    next(ex);
  }
});

// Get listing details:
apiRouter.get("/:listingId", async (req, res, next) => {
  try {
    res.send(await getListingById(req.params.listingId));
  } catch (ex) {
    next(ex);
  }
});

// Add a listing:
apiRouter.post("/", async (req, res, next) => {
  const { seller_id, listing_type, product_id, tags = [] } = req.body;

  const listingData = {};

  try {
    listingData.seller_id = seller_id;
    listingData.listing_type = listing_type;
    listingData.product_id = product_id;
    listingData.tags = tags;

    console.log(listingData);
    const listing = await createListing(listingData);
    console.log(listing);

    if (listing) {
      res.send(listing);
    } else {
      next({
        name: "ListingCreationError",
        message: "There was an error creating your listing. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Delete a listing:
apiRouter.delete("/:listingId", async (req, res, next) => {
  try {
    console.log(req.params);
    await deleteListing(req.params.listingId);
    res.send({ message: "deletion successful" });
  } catch (ex) {
    next(ex);
  }
});

// Change a listings's status:
apiRouter.patch("/:listingId", async (req, res, next) => {
  const { listingId } = req.params;
  const { status } = req.body;

  const updateFields = {};

  if (status) {
    updateFields.status = status;
  }

  try {
    const updatedListing = await updateListing(listingId, updateFields);
    res.send({ listing: updatedListing });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

/** Query & Display Routes */

/** Individual Listing Tag Routes */

/** Marketplace Routes */

/** Data Routes */


// API Export Route:
module.exports = apiRouter;
