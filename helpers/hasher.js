const crypto = require('crypto') // built in package / library

require('dotenv').config()

function hasher (pass){
    const hmac = crypto.createHmac('md5',process.env.HASH_SECRET)
    const afterHash = hmac.update(pass).digest('hex')
    return afterHash
}



module.exports = hasher