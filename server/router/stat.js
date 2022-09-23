var express     = require('express')
var router      = express.Router()

router.get('/', function(req, res, next) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('200 OK')
});

module.exports = router;