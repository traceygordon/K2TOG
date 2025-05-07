/** Express + API Route Functions */

// Express Imports:
   // const express = require("express");
  // const apiRouter = express.Router();

// JSON parser:
  // apiRouter.use(express.json());

// Routes for api requests (each file needs it's own defined path):
// File declararion:
  // const admin = require("./admin")
// Route declaration: 
  // apiRouter.use("/admins", admin)

  // const art = require("./art")
  // apiRouter.use("/pieces", art)

  // const contact = require("./contact")
  // apiRouter.use("/contact", contact)

  // const projects = require("./projects")
  // apiRouter.use("/projects", projects)

  // const tags = require("./tags")
  // apiRouter.use("/tags", tags)

  // const markers = require("./markers")
  // apiRouter.use("/markers", markers)

// Exporting express router to the various api files:

    // module.exports = apiRouter


// You need this at the top of the api pages: 
// Importing Express
   // const express = require("express");
   // const apiRouter = express.Router();


// You need this at the bottom of the api pages: 
// All api route files need to export the router so that the api.js file can create a link:
   // module.exports = apiRouter;
// This can't be in curlies like function exports