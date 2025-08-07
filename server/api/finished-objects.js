// Express Imports:
const express = require("express");
const apiRouter = express.Router();


// Function imports:
const {
  createFinishedObject,
  getFinishedObjectById,
  getAllFinishedObjects,
  getFinishedObjectBySize,
} = require("../db/models/finished-objects_models");

//Create a new finished objects:
apiRouter.post("/", async (req, res, next) => {
  const {
    pictures = [],
    name,
    size,
    quality,
    type,
    price,
    location,
    user_id,
    description = "",
  } = req.body;

  const finishedObjectData = {};

  try {
    finishedObjectData.pictures = pictures;
    finishedObjectData.name = name;
    finishedObjectData.size = size;
    finishedObjectData.quality = quality;
    finishedObjectData.type = type;
    finishedObjectData.price = price;
    finishedObjectData.location = location;
    finishedObjectData.user_id = user_id;
    finishedObjectData.description = description;

    console.log(finishedObjectData);
    const finishedObject = await createFinishedObject(finishedObjectData);
    console.log(finishedObject);

    if (finishedObject) {
      res.send(finishedObject);
    } else {
      next({
        name: "ObjectCreationError",
        message: "There was an error creating your finished object. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//Get finished objects by ID:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getFinishedObjectById(req.params.objectId));
  } catch (ex) {
    next(ex);
  }
});

//Get all finished objects:
apiRouter.get("/", async (res, next) => {
  try {
    res.send(await getAllFinishedObjects());
  } catch (ex) {
    next(ex);
  }
});

//Get finished object by size:
apiRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getFinishedObjectBySize(req.body.size));
  } catch (ex) {
    next(ex);
  }
});

// API Export Route:
module.exports = apiRouter;
