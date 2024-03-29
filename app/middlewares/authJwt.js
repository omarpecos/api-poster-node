const jwt = require("jsonwebtoken");
  //const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }

       //if blocked que retorne error también y no le deje hacer ninguna operacion!
      User.findById(decoded.id,(err,user) =>{
          if(err){
            req.userId = decoded.id;
            next();
          }
          if (user.active === false){
            return res.status(403).send({
              accessToken: 'blocked',
              message: "User blocked to do operations"
            });
          }else{
            // si va bien coje el id del user y sigue a la siguiente peticion
            req.userId = decoded.id;
            next();
          }
      });
    
    });
  };
  
  isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
  
      Role.find(
        {
          _id: { $in: user.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
  
          for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
              next();
              return;
            }
          }
  
          res.status(403).send({ message: "Require Admin Role!" });
          return;
        }
      );
    });
  };
  
  const authJwt = {
    verifyToken,
    isAdmin
  };
  
  module.exports = authJwt;