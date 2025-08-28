// Express Imports:
const express = require("express");
const apiRouter = express.Router();

// Function imports:
const {
  getAllTags,
  getListingsByTagName,
  getListingsByTagId,
  auditTagUsage,
  getTopTags,
  getTagUsagePercentages,
} = require("../db/models/tag_models");

// Get all tags:
apiRouter.get("/", async (res, next) => {
  try {
    const tags = await getAllTags();

    res.send({
      tags,
    });
  } catch (ex) {
    next(ex);
  }
});
// Get Listings by TagName:
apiRouter.get("/:tagName/listings", async (req, res, next) => {
  let { tagName } = req.params;
  // console.log("Inside api router:", tagName);

  // Ex: decodes %23film to #film
  tagName = decodeURIComponent(tagName);

  try {
    let result = await getListingsByTagName(tagName);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});
// Get Listings by TagId:
apiRouter.get("/:tagId/listings", async (req, res, next) => {
  try {
    let result = await getListingsByTagId(req.params.tagId);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});

/** Analytics Route(s) (for admin users) */
// Checking the # of Listings with a Tag:
apiRouter.get("/", async (req, res, next) => {
  try {
    let result = await auditTagUsage(req.params.tagId);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});
// Finding the Most Utilized Tag (Max Set to 10):
apiRouter.get("/", async (req, res, next) => {
  try {
    let result = await getTopTags(req.params.limit);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});
// Checking Tag Usage Percentages:
apiRouter.get("/", async (res, next) => {
  try {
    res.send(await getTagUsagePercentages());
  } catch (ex) {
    next(ex);
  }
});
;

// API Export Route:
module.exports = apiRouter;
