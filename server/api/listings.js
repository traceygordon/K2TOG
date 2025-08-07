// Express Imports:
const express = require("express");
const apiRouter = express.Router();


// Function imports:
const {
  getAllListings,
  getListingById,
  createListing,
  deleteListing,
  getListingsByUserId,
  getListingsByType,
  getAvailableListings,
  getArchivedListingsByUser,
  filterListings,
  addTagsToListing,
  removeTagFromListing,
  clearTagsFromListing,
  getTagsForListing,
  markListingAsSold,
  archiveListing,
  getListingStatus,
  getListingsSoldByUser,
  getListingsPurchasedByUser,
  getListingWithProduct,
  getListingWithFavorites,
  getListingWithMessages,
  getListingOwner,
  getListingTypePercentages,
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
/** The listing status is automatically set to available, and there are models to change the
 * status to sold or archived.
 */
// Change a listings's status to sold:
apiRouter.patch("/:listingId", async (req, res, next) => {
  try {
    await markListingAsSold(req.params.listingId);
    res.send({ message: "listing now marked as sold" });
  } catch (ex) {
    next(ex);
  }
});
// Change a listings's status to archived:
apiRouter.patch("/:listingId", async (req, res, next) => {
  try {
    await archiveListing(req.params.listingId);
    res.send({ message: "listing now marked as archived" });
  } catch (ex) {
    next(ex);
  }
});

/** Query & Display Routes */
// Get all listings for a user:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingsByUserId(req.params.userId));
  } catch (ex) {
    next(ex);
  }
});

//Get all listings of a specific type:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingsByType(req.params.type));
  } catch (ex) {
    next(ex);
  }
});

// Get all available listings:
apiRouter.get("/", async (res, next) => {
  try {
    res.send(await getAvailableListings());
  } catch (ex) {
    next(ex);
  }
});

// Get all archived listings:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getArchivedListingsByUser(req.params.userId));
  } catch (ex) {
    next(ex);
  }
});

// Search listings:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getArchivedListingsByUser(req.params.query));
  } catch (ex) {
    next(ex);
  }
});

// Filter listings:
apiRouter.get("/", async (req, res, next) => {
  const { priceMin, priceMax, quality, location } = req.body;

  const filterData = {};

  try {
    filterData.priceMin = priceMin;
    filterData.priceMax = priceMax;
    filterData.quality = quality;
    filterData.location = location;

    console.log(listingData);
    const results = await filterListings(filterData);
    console.log(results);

    if (results) {
      res.send(results);
    } else {
      next({
        name: "ListingFilterError",
        message: "There was an error filtering listings. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

/** Individual Listing Tag Routes */
// Get all of a listing's tags:
apiRouter.get("/:listingId", async (req, res, next) => {
  try {
    res.send(await getTagsForListing(req.params.listingId));
  } catch (ex) {
    next(ex);
  }
});

// Add tags to a listing:
apiRouter.post("/:listingId", async (req, res, next) => {
  try {
    res.status(201).send(
      await addTagsToListing({
        listingId: req.params.listingId,
        tagId: req.body.tagId,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

// Delete a tags from a listing:
apiRouter.delete("/:listingId", async (req, res, next) => {
  try {
    await removeTagFromListing({
      listingId: req.params.listingId,
      tagId: req.params.tagId,
    });
    res.send({ message: "tag deletion successful" });
  } catch (ex) {
    next(ex);
  }
});

// Delete all tags from a listing:
apiRouter.delete("/:listingId", async (req, res, next) => {
  try {
    console.log(req.params);
    await clearTagsFromListing(req.params.listingId);
    res.send({ message: "full tag list deletion successful" });
  } catch (ex) {
    next(ex);
  }
});

/** Marketplace Routes */
// Get a listing's status:
apiRouter.get("/:listingId", async (req, res, next) => {
  try {
    res.send(await getListingStatus(req.params.listingId));
  } catch (ex) {
    next(ex);
  }
});
// Get all listings sold by a user:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingsSoldByUser(req.params.userId));
  } catch (ex) {
    next(ex);
  }
});
// Get all listings purchased by a user:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingsPurchasedByUser(req.params.userId));
  } catch (ex) {
    next(ex);
  }
});

/** Data Routes */
// Get listings organized by type:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingWithProduct(req.params.listingId));
  } catch (ex) {
    next(ex);
  }
});
// Get all favorited listings for a user:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getListingWithFavorites(req.params.userId));
  } catch (ex) {
    next(ex);
  }
});
// Get all listings with messages for a user:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(
      await getListingWithMessages(req.params.listingId, req.params.userId)
    );
  } catch (ex) {
    next(ex);
  }
});
// Get all listings by an owner:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(
      await getListingOwner(req.params.listingId)
    );
  } catch (ex) {
    next(ex);
  }
});

/** Analytics Route(s) (for admin users) */
// Get listings percentages:
apiRouter.get("/", async (res, next) => {
  try {
    res.send(await getListingTypePercentages());
  } catch (ex) {
    next(ex);
  }
});

// API Export Route:
module.exports = apiRouter;
