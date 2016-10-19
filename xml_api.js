var xml2json = require('xml2Json');

exports.parseDict = function(xmlstr){
	return JSON.parse(xml2json.toJson(xmlstr))['response']['data'];
}