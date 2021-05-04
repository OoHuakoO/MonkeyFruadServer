const { auth, firestore } = require("../models/index"),
  express = require("express"),
  passport = require("passport"),
  multer = require("multer"),
  router = express.Router(),
  bcrypt = require("bcryptjs"),
  { Result } = require("express-validator"),
  cloudinary = require("../utils/cloudinary"),
  path = require("path");
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  }
};
let upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

const uploadFile = (req, res, next) => {
  const upload2 = upload.fields([{ name: "photo", maxCount: 1 }]);
  upload2(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ msg: "** ไฟล์รูปต้องมีขนาดไม่เกิน 1 MB **" });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

router.post("/signup", async (req, res) => {
  var usernameExist = false;
  var date = new Date();
  var item = [];
  const {
    firstname,
    surname,
    sex,
    province,
    email,
    password,
    username,
    phone,
  } = req.body;
  console.log(
    firstname,
    surname,
    sex,
    province,
    email,
    password,
    username,
    phone
  );
  await firestore
    .collection("User")
    .where("username", "==", username)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        item.push(doc.data());
      });
      if (item[0] === undefined) {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then((result) => {
            console.log(result);
            if (result) {
              const userRef = firestore.collection("User").doc(result.user.uid);
              userRef.set({
                uid: result.user.uid,
                username: username,
                email: result.user.email,
                firstname: firstname,
                surname: surname,
                sex: sex,
                phone: phone,
                province: province,
                role: "user",
                date: date,
              });
              return res.json({ user: result, usernameExist: usernameExist });
            }
          })
          .catch((err) => {
            res.status(400).json({ error: err });
          });
      } else if (item[0] !== undefined) {
        usernameExist = true;
        return res.json({ usernameExist: usernameExist });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // console.log("EIEI");
});
router.post("/googlesignup", function (req, res) {
  try {
    const { result } = req.body;
    var date = new Date();
    if (result) {
      const userRef = firestore.collection("User").doc(result.user.uid);
      userRef.get().then((doc) => {
        if (!doc.data()) {
          userRef.set({
            uid: result.user.uid,
            email: result.user.email,
            role: "user",
            username: result.user.displayName,
            firstname: "-",
            surname: "-",
            sex: "-",
            phone: "-",
            province: "-",
            date: date,
            login: "google",
          });
          return res.json({ msg: "google signup success" });
        } else {
          res.status(200).json({ msg: "มีผู้ใช้งานนี้อยู่แล้ว" });
        }
      });
    }
  } catch {
    (err) => {
      res.status(400).json({ error: err });
    };
  }
});

router.post("/facebooksignup", function (req, res) {
  try {
    const { result } = req.body;
    var date = new Date();
    if (result) {
      const userRef = firestore.collection("User").doc(result.user.uid);
      userRef.get().then((doc) => {
        if (!doc.data()) {
          userRef.set({
            uid: result.user.uid,
            email: result.user.email,
            role: "user",
            username: result.user.displayName,
            firstname: "-",
            surname: "-",
            sex: "-",
            phone: "-",
            province: "-",
            date: date,
          });
          return res.json({ msg: "facebook signup success" });
        } else {
          res.status(200).json({ msg: "มีผู้ใช้งานนี้อยู่แล้ว" });
        }
      });
    }
  } catch {
    (err) => {
      res.status(400).json({ error: err });
    };
  }
});

router.post("/remember", function (req, res) {
  res.json({ success: true });
});

router.post("/session", function (req, res) {
  const { user } = req.body;
  firestore
    .collection("User")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.json({ data: doc.data() });
      } else {
        console.log("No such document");
      }
    })
    .catch((Error) => {
      console.log(Error);
    });
});

router.post("/login", function (req, res) {
  const { email, password } = req.body;
  const userLogin = auth
    .signInWithEmailAndPassword(email, password)
    .then((result) => {
      res.json({ success: result });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.post("/userid", (req, res) => {
  try {
    const { result } = req.body;

    const userRef = firestore.collection("User").where("uid", "==", result.uid);
    userRef.get().then((doc) => {
      let item = [];
      doc.forEach((doc2) => {
        item.push(doc2.data());
      });
      res.json({
        item,
      });
    });
  } catch {
    (err) => {
      console.log(err);
    };
  }
});

router.post("/edit/profile/:uid", uploadFile, async (req, res) => {
  try {
    let file = req.files.photo;
    let uid = req.params.uid;
    let item = [];
    let item2 = [];
    var usernameExist = false;
    const { firstname, username, surname, sex, phone, province } = req.body;
    await firestore
      .collection("User")
      .where("username", "==", username)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          item.push(doc.data());
        });
      });
    await firestore
      .collection("User")
      .where("uid", "==", uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          item2.push(doc.data());
        });
      });
    if (item2[0].username !== username) {
      if (item[0] === undefined) {
        usernameExist = false;
        if (file) {
          const resultfile = await cloudinary.uploader.upload(file[0].path);
          const { url, public_id } = resultfile;
          const photoURL = { url, public_id };
          const showdata = await firestore
            .collection("Post")
            .where("useruid", "==", uid);
          showdata.get().then((ok) => {
            let item = [];
            ok.forEach((doc) => {
              item.push(doc.data());
            });
            console.log(item);
            item.forEach((kuay) => {
              const findpost = firestore
                .collection("Post")
                .doc(kuay.uid)
                .update({ username, photoURL });
            });
          });

          const comment = await firestore
            .collection("Comment")
            .where("userid", "==", uid);
          comment.get().then((ok) => {
            let item = [];
            ok.forEach((doc) => {
              item.push(doc.data());
            });
            console.log(item);
            item.forEach((com) => {
              const comment = firestore
                .collection("Comment")
                .doc(com.commentid)
                .update({ username, photoURL });
            });
          });

          firestore.collection("User").doc(uid).update({
            firstname,
            username,
            surname,
            sex,
            phone,
            province,
            photoURL,
          });
        } else if (!file) {
          firestore.collection("User").doc(uid).update({
            firstname,
            username,
            surname,
            sex,
            phone,
            province,
          });

          const showdata = await firestore
            .collection("Post")
            .where("useruid", "==", uid);
          showdata.get().then((ok) => {
            let item = [];
            ok.forEach((doc) => {
              item.push(doc.data());
            });
            console.log(item);
            item.forEach((kuay) => {
              const findpost = firestore
                .collection("Post")
                .doc(kuay.uid)
                .update({ username });
            });
          });

          const comment = await firestore
            .collection("Comment")
            .where("userid", "==", uid);
          comment.get().then((ok) => {
            let item = [];
            ok.forEach((doc) => {
              item.push(doc.data());
            });
            console.log(item);
            item.forEach((com) => {
              const findpost = firestore
                .collection("Comment")
                .doc(com.commentid)
                .update({ username });
            });
          });
        }
        return res.json({
          success: "แก้ไขสำเร็จ",
          usernameExist: usernameExist,
        });
      } else if (item[0] !== undefined) {
        usernameExist = true;
        return res.json({
          usernameExist: usernameExist,
        });
      }
    } else if (item2[0].username === username) {
      if (file) {
        const resultfile = await cloudinary.uploader.upload(file[0].path);
        const { url, public_id } = resultfile;
        const photoURL = { url, public_id };
        const showdata = await firestore
          .collection("Post")
          .where("useruid", "==", uid);
        showdata.get().then((ok) => {
          let item = [];
          ok.forEach((doc) => {
            item.push(doc.data());
          });
          console.log(item);
          item.forEach((kuay) => {
            const findpost = firestore
              .collection("Post")
              .doc(kuay.uid)
              .update({ username, photoURL });
          });
        });

        const comment = await firestore
          .collection("Comment")
          .where("userid", "==", uid);
        comment.get().then((ok) => {
          let item = [];
          ok.forEach((doc) => {
            item.push(doc.data());
          });
          console.log(item);
          item.forEach((com) => {
            const comment = firestore
              .collection("Comment")
              .doc(com.commentid)
              .update({ username, photoURL });
          });
        });

        firestore.collection("User").doc(uid).update({
          firstname,
          username,
          surname,
          sex,
          phone,
          province,
          photoURL,
        });
      } else if (!file) {
        firestore.collection("User").doc(uid).update({
          firstname,
          username,
          surname,
          sex,
          phone,
          province,
        });

        const showdata = await firestore
          .collection("Post")
          .where("useruid", "==", uid);
        showdata.get().then((ok) => {
          let item = [];
          ok.forEach((doc) => {
            item.push(doc.data());
          });
          console.log(item);
          item.forEach((kuay) => {
            const findpost = firestore
              .collection("Post")
              .doc(kuay.uid)
              .update({ username });
          });
        });

        const comment = await firestore
          .collection("Comment")
          .where("userid", "==", uid);
        comment.get().then((ok) => {
          let item = [];
          ok.forEach((doc) => {
            item.push(doc.data());
          });
          console.log(item);
          item.forEach((com) => {
            const findpost = firestore
              .collection("Comment")
              .doc(com.commentid)
              .update({ username });
          });
        });
      }
      usernameExist = false;
      return res.json({
        usernameExist: usernameExist,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
});

router.get("/profile/:uid", async (req, res) => {
  try {
    let getid = req.params.uid;
    const Userdetail = await firestore
      .collection("Post")
      .where("uid", "==", getid)
      .get();
    Userdetail.forEach((doc) => {
      let item = [];
      item.push(doc.data());

      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.get("/session/:uid", async (req, res) => {
  try {
    let getid = req.params.uid;
    const Userdetail = await firestore
      .collection("User")
      .where("uid", "==", getid)
      .get();
    Userdetail.forEach((doc) => {
      let item = [];
      item.push(doc.data());

      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});
router.get("/listuserofday", async (req, res) => {
  try {
    var data = [];
    var date = new Date();
    var last6day = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const listUser = await firestore
      .collection("User")
      .where("date", ">=", last6day)
      .where("date", "<=", date)
      .orderBy("date", "asc")
      .get();
    listUser.forEach((doc) => {
      data.push(doc.data());
    });
    return res.json({
      data,
    });
  } catch (err) {
    return console.log(err);
  }
});
router.get("/listuserofmonth", async (req, res) => {
  try {
    var data = [];
    var date = new Date();
    var last29day = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    const listUser = await firestore
      .collection("User")
      .where("date", ">=", last29day)
      .where("date", "<=", date)
      .orderBy("date", "asc")
      .get();
    listUser.forEach((doc) => {
      data.push(doc.data());
    });
    return res.json({
      data,
    });
  } catch (err) {
    return console.log(err);
  }
});
router.get("/listuserofyear", async (req, res) => {
  try {
    const showdata = await firestore.collection("User").orderBy("date", "asc");
    showdata.get().then((ok) => {
      let data = [];
      ok.forEach((doc) => {
        data.push(doc.data());
      });
      return res.json({
        data,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});
module.exports = router;
