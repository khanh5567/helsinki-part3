require("dotenv").config();

const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
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

app.get("/api/persons", (req, res) => {
  Person.find({}).then((savedPeople) => {
    res.json(savedPeople);
  });
});

app.get("/api/info", (req, res) => {
  Person.countDocuments({}).then((count) => {
    const message = "Phonebook has info for " + count + " people";
    const date = new Date(8.64e15).toString();
    res.status(200).send(`${message}<br>${date}`);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((returnedPerson) => {
      if (returnedPerson) res.json(returnedPerson);
      else res.status(404).json({ error: "No record found" });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((deletedPerson) => {
      if (deletedPerson) res.status(204).end();
      else res.status(404).json({ error: "Person Not Found" });
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

app.post("/api/persons", (req, res) => {
  const name = req.body.name;
  const number = req.body.number;

  if (!name || !number) res.status(400).json({ error: "Missing body" });
  else {
    const newPerson = new Person({
      name: name,
      number: number,
    });
    newPerson.save().then((savedPerson) => {
      res.json(savedPerson);
    });
  }
});

app.put("/api/persons/:id", (req, res, next) => {
  const updatedPerson = {
    name: req.body.name,
    number: req.body.number,
  };
  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true })
    .then((returnedPerson) => {
      res.status(201).json(returnedPerson);
    })
    .catch((error) => next(error));
});

const errorHandlerMiddleware = (error, request, response, next) => {
  console.log(error);

  if (error.name === "CastError")
    response.status(400).json({ error: "Invalid ID format" });
  else next(error);
};

app.use(errorHandlerMiddleware);

const PORT = 3001;
app.listen(PORT);
console.log("Server up at ", PORT);
