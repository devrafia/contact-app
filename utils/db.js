const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/wpu");

// Menambah 1 data
// const contact1 = new Contact({
//   nama: "Doddy",
//   no: "081888999231",
//   email: "doddy@gmail.com",
// });

// simpan ke collection
// contact1.save().then((result) => {
//   console.log(result);
// });
