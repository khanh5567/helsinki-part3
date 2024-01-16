const mongoose = require("mongoose");

const argLen = process.argv.length;
if (argLen < 3) {
  console.log("provide password");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://jimmy:${password}@cluster0.b4jqvyu.mongodb.net/noteApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (argLen === 3) {
  Person.find({}).then((result) => {
    console.log("phonebook");
    result.forEach((person) => console.log(person.name + " " + person.number));
    mongoose.connection.close();
  });
} else if (argLen !== 5) {
  console.log("give name and number as arguments");
  process.exit(1);
} else {
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
