//import environment var
require("dotenv").config();

//import modules/middlewares
const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

//add middlewares to the cycle
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

//route handler for GET request
app.get("/api/persons", (req, res) => {
  //execute mongoose query with then() and send result back
  Person.find({}).then((savedPeople) => {
    res.json(savedPeople);
  });
});

//handle route for summarized stuff
app.get("/api/info", (req, res) => {
  Person.countDocuments({}).then((count) => {
    const message = "Phonebook has info for " + count + " people";
    const date = new Date(8.64e15).toString();
    res.status(200).send(`${message}<br>${date}`);
  });
});

//route handler for specific person
app.get("/api/persons/:id", (req, res, next) => {
  //mongoose stuff again
  Person.findById(req.params.id)
    .then((returnedPerson) => {
      if (returnedPerson) res.json(returnedPerson);
      else res.status(404).json({ error: "No record found" });
    })
    .catch((error) => next(error));
});

//route handler for deleting person
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((deletedPerson) => {
      //check for success in deletion
      if (deletedPerson) res.status(204).end();
      else res.status(404).json({ error: "Person Not Found" });
    })
    .catch((error) => {
      next(error);
    });
});

//route handler for creating a new person
app.post("/api/persons", (req, res, next) => {
  //destructing an object
  const { name, number } = req.body;
  //check for invalid input
  if (!name || !number) res.status(400).json({ error: "Missing body" });
  else {
    const newPerson = new Person({ name, number });
    newPerson
      .save()
      .then((savedPerson) => {
        res.json(savedPerson);
      })
      .catch((error) => next(error));
  }
});

//route handler for updating person
app.put("/api/persons/:id", (req, res, next) => {
  const updatedPerson = {
    name: req.body.name,
    number: req.body.number,
  };
  //add options for validation, not on by default like POST
  Person.findByIdAndUpdate(req.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((returnedPerson) => {
      res.status(201).json(returnedPerson);
    })
    .catch((error) => next(error));
});

const errorHandlerMiddleware = (error, request, response, next) => {
  //handle known errors
  if (error.name === "CastError")
    response.status(400).json({ error: "Invalid ID format" });
  else if (error.name === "ValidationError")
    response.status(400).json({ error: error.message });
  //pass it to default Express error handler if not known
  else next(error);
};

app.use(errorHandlerMiddleware);

//initialize the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server up at ", PORT);
});
