require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

//URI pulled from env file
const url = process.env.MONGO_URI;

console.log("connecting to", url);

//establish a connection
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

//define the schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    required: true,
  },
  number: String,
});

//toJSON do things to the res.json in node
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

//import Person model (constructor) so index can use to do CRUD stuff
module.exports = mongoose.model("Person", personSchema);
