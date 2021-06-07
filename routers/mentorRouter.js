const db = require('../databases/mysql')
const Router = require('express').Router()
const fileUpload = require('../helpers/fileUpload')
const passwordHasher = require('../helpers/hasher')
const fs = require('fs')
const { auth } = require('../helpers/jwt')

const MAX_IMAGE_SIZE = 1000000
const ALLOWED_FILE = 'image'
const ERROR_MESSAGE_IMAGE = 'File must be image and below 1 mb'
const SUCCESS_INSERT_MESSAGE = 'Insert new mentor success'
const SUCCESS_EDIT_MESSAGE = 'Edit data success'
const SUCCESS_DELETE_MESSAGE = 'Delete data success'
const USER_NOT_FOUND = 'User not found'
const IMAGE_MUST_EXIST = 'Image must be uploaded'


// get all mentors or filter mentor by email, name, role
Router.get('/' ,  (req,res,next) => {
  let sql = 'select * from mentor'
  const queries = ['email','name','role'].filter(field => req.query[field]);
  if (queries.length) {
    sql += ' WHERE ';
    sql += queries.map(field => `${field} = ?`).join(' AND ');
  }
  db.query(
    sql,
    queries.map(field => req.query[field]),
    (err,result) => {
    if(err) next(err)
    res.send(result)
  })
}) 

// get mentor by id
Router.get('/:id', (req,res,next) => {
  const { id } = req.params
  let sql = 'select * from mentor where id = ?'
  db.query( sql, id, (err,result) => {
      if(err) next(err)
      res.send(result)
  })
})

// post new mentor with image upload for avatar
Router.post('/', auth, (req,res,next) => {
  const upload = fileUpload.single('avatar')
  upload(req,res,(err) => {
    if(err) next(err)
    const { file } = req
    if(!file){
      next({ message : IMAGE_MUST_EXIST })
      return
    }
    
    if(file.size > MAX_IMAGE_SIZE || !file.mimetype.includes(ALLOWED_FILE)){
      next({ message : ERROR_MESSAGE_IMAGE })
      try {
        fs.unlinkSync(oldImage)
      } catch (error) {
        next(error)
        return
      }
      return
    }else{

      let { dataMentor } = req.body
      dataMentor = JSON.parse(dataMentor)
      dataMentor.avatar = file.path

      const passwordHashed = passwordHasher(dataMentor.password)
      dataMentor.password = passwordHashed
      
      const sql = 'insert into mentor set ?;'
      db.query(sql,dataMentor,(err) => {
        if(err) next(err)
        res.send({message : SUCCESS_INSERT_MESSAGE })
      })
    }

  })
})

//edit mentor data with image
Router.patch('/:id', auth, (req,res,next) => {
  const upload = fileUpload.single('avatar')
  const { id } = req.params
  upload(req,res,(err) => {
    if(err) next(err)
    const {file} = req
    if(file){

      if(file.size > MAX_IMAGE_SIZE || !file.mimetype.includes(ALLOWED_FILE)){
        next({ message : ERROR_MESSAGE_IMAGE })
        fs.unlinkSync(file.path)
      }else{

        // delete old image on server
        const sqlGetAvatar = 'select avatar from mentor where id = ?'
        db.query(sqlGetAvatar, id, (err,result) => {
          if(err) next(err)
          if(!result.length) {
            next({message : USER_NOT_FOUND})
            return
          }
          const { avatar : oldImage } = result[0]

          try {
            fs.unlinkSync(oldImage)
          } catch (error) {
            console.log(error)
          }

          // insert new image to database
          let { dataMentor : dataToUpdate } = req.body
          dataToUpdate = JSON.parse(dataToUpdate)
          dataToUpdate.avatar = file.path

          const sqlUpdate = 'update mentor set ? where id = ?'
          db.query(sqlUpdate, [dataToUpdate,id], (err) => {
            if(err) next(err)
            res.send({ message : SUCCESS_EDIT_MESSAGE })
          })
        })
      }
    } else {
      let { dataMentor : dataToUpdate } = req.body
      dataToUpdate = JSON.parse(dataToUpdate)
      const sqlUpdate = 'update mentor set ? where id = ?'
      db.query(sqlUpdate, [dataToUpdate,id], (err) => {
        if(err) next(err)
        res.send({ message : SUCCESS_EDIT_MESSAGE })
      })

    }
  })
})

Router.delete('/:id' ,auth, (req,res,next) => {
  const { id } = req.params
  const getAvatarQuery = 'select avatar from mentor where id = ?;'
  db.query(getAvatarQuery, id, (err,result) => {
    if(err) next(err)
    if(!result.length) {
      next({message : USER_NOT_FOUND})
      return
    }

    const { avatar : oldImage } = result[0]

    try {
      fs.unlinkSync(oldImage)
    } catch (error) {
      console.log(error)
    }

    const deleteQuery = 'delete from mentor where id = ?'
    db.query(deleteQuery, id, (err) => {
      if(err) next(err)
      res.send({ message : SUCCESS_DELETE_MESSAGE })
    })
  })
})

module.exports = Router
