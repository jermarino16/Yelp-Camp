const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

const redisUrl = "????";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget); //makes function return a promise

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
	this.useCache = true; //this refers to query instance
	this.hashKey = JSON.stringify(options.key || '');
	
	return this; //makes this function chainable
}

mongoose.Query.prototype.exec = async function () {
	if(!this.useCache){
		return exec.apply(this, arguments);
	}
	console.log("serving from redis");
	//create the key with values from query and name
	const key = JSON.stringify(
		Object.assign({}. this.getQuery(), {
			collectio: this.mongooseCollection.name
		})
	);
	
	//see if we have a value for key in redis
	const cacheValue = await client.hget(this.hashKey, key);
	
	//if we do return it
	if (cacheValue){
		const doc = JSON.parse(cacheValue);
		
		return Array.isArray(doc) 
			? doc.map(d => new this.model(d)) : new this.model(doc);
	} else{ //otherwise issue query and store results in redis then return
		const result = await exec.apply(this, arguments);
		
		const cache_result = JSON.stringify(result);
		client.hset(this.hashKey, key, cache_result, "EX", 10);
		
		return result;
	}
}