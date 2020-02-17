const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
	await next(); //call the route handle to finish its job then clear cache
	
	clearHash(req.user.id);
}