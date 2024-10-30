const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
var methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Setup method override
app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs"); // gunakan ejs
app.use(expressLayouts); // Third-party Middleware
app.use(express.static("public")); // Built in Middleware
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Sandhika Galih",
      email: "sandhika@gmail.com",
    },
    {
      nama: "Doddy",
      email: "doddy@gmail.com",
    },
    {
      nama: "Erik",
      email: "erik@gmail.com",
    },
  ];
  res.render("index", {
    nama: "Sandhika",
    title: "Halaman Home",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

// Halaman About
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

// Halaman Contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form tambah data contact",
    layout: "layouts/main-layout",
  });
});

// proses data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("no", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "Form tambah data contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      // addContact(req.body);
      const contact = new Contact(req.body);
      await contact.save();
      console.log(contact);
      req.flash("msg", "Data contact berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

// proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     // deleteContact(req.params.nama);
//     await Contact.deleteOne({ nama: req.params.nama });
//     req.flash("msg", "Data contact berhasil dihapus!");
//     res.redirect("/contact");
//   }
// });

app.delete("/contact", async (req, res) => {
  await Contact.deleteOne({ nama: req.body.nama });
  req.flash("msg", "Data contact berhasil dihapus!");
  res.redirect("/contact");
});

// form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form ubah data contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("no", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "Form ubah data contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      await Contact.updateOne(
        {
          _id: req.body._id,
        },
        req.body
      );
      console.log(req.body);
      req.flash("msg", "Data contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});
