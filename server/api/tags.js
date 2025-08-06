// Express Imports:
const express = require("express");
const apiRouter = express.Router();
// JSON parser:
apiRouter.use(express.json());
// Middleware for printing information + errors:
apiRouter.use(require("morgan")("dev"));


// Function imports:
const { getAllTags, getPiecesByTagName } = require("../db/db");

// JSON parser:
apiRouter.use(express.json());

// Middleware for printing information + errors:
apiRouter.use(require("morgan")("dev"));

// Get all tags:
apiRouter.get("/", async (req, res, next) => {
  try {
    const tags = await getAllTags();

    res.send({
      tags,
    });
  } catch ({ medium, message }) {
    next({ medium, message });
  }
});

// Get Pieces by TagName:
apiRouter.get("/:tagName/pieces", async (req, res, next) => {
  let { tagName } = req.params;
  // console.log("Inside api router:", tagName);

  // Ex: decodes %23film to #film
  tagName = decodeURIComponent(tagName);
  
  try {
    let result = await getPiecesByTagName(tagName);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});


// API Export Route: 
module.exports = apiRouter;