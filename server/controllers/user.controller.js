import User from "../models/user.model";
import Car from "../models/user.model";
import jwt from "jwt-simple"; 

/**
 * POST /api/v1/user/signup
 */
function signup(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({ success: false, msg: "Please pass name and password." });
  } else {
    const newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    // save the user
    newUser.save(err => {
      if (err) {
        return res.json({ success: false, msg: "Username already exists." });
      }
      res.json({ success: true, msg: "Successful created new user." });
    });
  }
}

/**
 * POST /api/v1/user/signin
 */
function signin(req, res) {
  Car.findOne({ name: req.body.name }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, msg: "Authentication failed. User not found." });
    } else {
      // check if password matches
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          const token = jwt.encode(user, process.env.SECRET);
          // return the information including token as JSON
          res.json({ success: true, token: `bearer ${token}` });
        } else {
          res.send({ success: false, msg: "Authentication failed. Wrong password." });
        }
      });
    }
  });
}

function signal(req, res) {
  console.log(req.body);
  Car.findOne({ id: req.body.id }, (err, record) => {
    console.log('record>>>>', record);
    if(!record) {
      const newRecord = new Car({
        id: req.body.id,
        flag: req.body.flag
      });
      newRecord.save(err => {
        if (err) {
          return res.json({ success: false, msg: "Record already exists." });
        }
        res.json({ success: true, msg: "Successful created new car." });
      });
    }
    else {
      Car.findByIdAndUpdate(record._id,req.body,{new:true})   
      .then((docs)=>{
        if(docs) {
          res.json({success:true, data:docs});
        } else {
          res.json({success:false,data:"no such user exist"});
        }
    }).catch((err)=>{
      //  reject(err);
      res.json({ success: true, msg: err });
    })
  }
  }).catch(err => {
    if(err.kind === 'ObjectId') {
      const newRecord = new Car({
        id: req.body.id,
        flag: req.body.flag
      });
      newRecord.save(err => {
        if (err) {
          return res.json({ success: false, msg: "Record already exists." });
        }
        res.json({ success: true, msg: "Successful created new car." });
      });                
    }
  });

  
  // User.findOne({ name: req.body.name }, (err, user) => {
  //   if (err) throw err;

  //   if (!user) {
  //     res.send({ success: false, msg: "Authentication failed. User not found." });
  //   } else {
  //     // check if password matches
  //     user.comparePassword(req.body.password, (err, isMatch) => {
  //       if (isMatch && !err) {
  //         // if user is found and password is right create a token
  //         const token = jwt.encode(user, process.env.SECRET);
  //         // return the information including token as JSON
  //         res.json({ success: true, token: `bearer ${token}` });
  //       } else {
  //         res.send({ success: false, msg: "Authentication failed. Wrong password." });
  //       }
  //     });
  //   }
  // });
}

function getAllSignals(req, res) {
  Car.find({}, (err, record) => {
      if (err) throw err;

      if (!record) {
        return res.status(403).send({ success: false, msg: "Authentication failed. User not found." });
      } else {
        res.json({ success: true, msg: record });
      }
    });
}

/**
 * GET /api/v1/user/profile
 */
function getUser(req, res) {
  const token = getToken(req.headers);
  if (token) {
    const decoded = jwt.decode(token, process.env.SECRET);
    User.findOne({ name: decoded.name }, (err, user) => {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({ success: false, msg: "Authentication failed. User not found." });
      } else {
        res.json({ success: true, msg: `Welcome in the member area ${user.name}!` });
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: "No token provided." });
  }
}

function getToken(headers) {
  if (headers && headers.authorization) {
    const parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export default { signin, signup, getUser, signal, getAllSignals };
