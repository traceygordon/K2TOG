/** Express + API Route Functions */

// Express Imports:
   const express = require("express");
  const apiRouter = express.Router();

// JSON parser:
  apiRouter.use(express.json());

// Routes for api requests (each file needs it's own defined path):
// File declararion:
  const favorites = require("./favorites")
// Route declaration: 
  apiRouter.use("/favorites", favorites)

  const finishedObjects = require("./finished-objects")
  apiRouter.use("/finished-objects", finishedObjects)

  const listings = require("./listings")
  apiRouter.use("/listings", listings)

  const notions = require("./notions")
  apiRouter.use("/notions", notions)

  const ratings = require("./ratings")
  apiRouter.use("/ratings", ratings)

  const tags = require("./tags")
  apiRouter.use("/tags", tags)

  const users = require("./users")
  apiRouter.use("/users", users)

  const yarn = require("./yarn")
  apiRouter.use("/yarn", yarn)

// Exporting express router to the various api files:

    module.exports = apiRouter


// You need this at the top of the api pages: 
// Importing Express
   // const express = require("express");
   // const apiRouter = express.Router();


// You need this at the bottom of the api pages: 
// All api route files need to export the router so that the api.js file can create a link:
   // module.exports = apiRouter;
// This can't be in curlies like function exports