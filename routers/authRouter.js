const db = require('../databases/mysql')
const Router = require('express').Router()
const passwordHasher = require('../helpers/hasher')
const { createJwt } = require('../helpers/jwt')
const FORM_NOT_COMPLETE_MESSAGE = 'username atau password masih kosong'
const INCORRECT_DATA = 'username atau password salah'

Router.post('/login', (req,res,next) => {
  const { email, password } = req.body
  if(email && password){
    const passwordHashed = passwordHasher(password)
    const queryLogin = 'select * from users where email = ? and password = ?;'

    db.query(queryLogin,[email,passwordHashed], (err,result) => {
      if(err){
        next(err) 
        return
      }

      if(!result.length){
        next( {message : INCORRECT_DATA})
        return
      }

      const { email , role, name, id, avatar } = result[0]

      const token = createJwt({email,role,name,id,avatar})

      res.send({
        message : "Login Success",
        data : {id, email, role, name, avatar},
        token : token
      })

    })
  }else{
    next({ message : FORM_NOT_COMPLETE_MESSAGE})
  }
})

module.exports = Router