const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("./models/user");
const dataModel = require("./models/data");
const user = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//==========home cum signup============
app.get("/", function (req, res) {
  res.render("signup");
});

//==========registeration==========
app.post("/register", async function (req, res) {
  let { email, password, name, username } = req.body;
  let existinguser = await userModel.findOne({ email });
  if (existinguser) {
    return res.send("User already registered");
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        email,
        password: hash,
        name,
        username,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.redirect("/home");
    });
  });
});

//==========login==========
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("something went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.status(200).redirect("/home");
    } else res.redirect("/login");
  });
});

//==========logout==========
app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});

//==========middleware==========
function isloggedin(req, res, next) {
  if (req.cookies.token === "") return res.send("You have to login first");
  let data = jwt.verify(req.cookies.token, "secret");
  req.user = data;
  next();
}

//==========home==========
app.get("/home", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  res.render("home", { user });
});

//==========test==========
app.get("/test", async function (req, res) {
  res.render("test");
});

// app.post("/test", async function(req, res) {
//   try {
//     const { maxspeed } = req.body;
//     const user = await userModel.findOne({ email: req.user.email });

//     if (!user) return res.status(404).send("User not found");

//     let data = await dataModel.findOne({ userinfo: user._id });

//     if (!data) {
//       data = new dataModel({
//         userinfo: user._id,
//         totaltests: 1,
//         maxSpeed: maxspeed,
//         avgSpeed: maxspeed
//       });
//     } else {
//       data.totaltests += 1;

//       if (maxspeed > data.maxSpeed) {
//         data.maxSpeed = maxspeed;
//       }

//       data.avgSpeed = ((data.avgSpeed * (data.totaltests - 1)) + maxspeed) / data.totaltests;
//     }

//     await data.save();

//     console.log(data);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//    }
// });



//==========profile==========
app.get("/profile", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  let data = await dataModel.findOne({ userinfo: user._id });

  // ✅ If no data found, create a new one
  if (!data) {
    data = await dataModel.create({ userinfo: user._id });
  }

  res.render("profile", { user, data });
});

app.listen(3000);
