const express = require("express");
var morgan = require("morgan");
const app = express();
app.use(express.json());

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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
  res.json(data);
});

app.get("/api/info", (req, res) => {
  const message = "Phonebook has info for " + data.length + " people";
  const date = new Date(8.64e15).toString();
  res.status(200).send(`${message}<br>${date}`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = data[id]; //no need to check out of bound hehe
  if (person) res.json(person);
  else res.status(404).json({ error: "No record found" });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((person) => person.id !== id);
  res.status(204).end();
});

const generateID = () => {
  return Math.floor(Math.random() * 10000);
};

app.post("/api/persons", (req, res) => {
  const id = generateID();
  const name = req.body.name;
  const number = req.body.number;

  if (!name || !number) res.status(400).json({ error: "Missing body" });
  else if (data.map((person) => person.name).includes(name)) {
    res.status(400).json({ error: "name already exist" });
  } else {
    const newData = {
      id: id,
      name: name,
      number: number,
    };
    data.push(newData);
    res.status(201).json(newData);
  }
});

const PORT = 3001;
app.listen(PORT);
console.log("Server up at ", PORT);
