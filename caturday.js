var express = require('express');
var request = require('request');
var url = require('url');
var xml_api = require('./xml_api.js');
var _ = require('underscore')

app = express();

app.get('index')
app.listen(8080);


get_categories = function(callback){
	cat_url = 'http://thecatapi.com/api/categories/list';
	request(cat_url, function(error, response, body){

		cats_arr = xml_api.parseDict(body)['categories']['category'];

		// tbh, an aggregation of the name values is all we need (ids are never used)
		// but it was a good excuse to use a reduce function :)
		cats = _.reduce(cats_arr, function(m,x){
			m[x['name']] = x['id']; 
			return m;
		},{});

		callback(cats);
	});
}

get_random_pic = function(category, callback){
	options = {protocol: 'http',
				host: "thecatapi.com",
				pathname: "/api/images/get",
				query: {format: 'xml',
						results_per_page: 1,
						category:category,
				    	type:'gif'}};

	photo_url = url.format(options);
	// console.log(photo_url);

	request(photo_url, function(error, response, body){
			image = xml_api.parseDict(body)['images']['image'];
			if(image){
				callback(true, image['source_url'], image['url']);
			}
			else{
				callback(false, null, null);
			}
	});

}

app.get('/', function(req, res){
	get_categories(function(photo_categories){
		res.locals = {categories: photo_categories};
		res.render('categories.ejs');
	});
});

app.get('/random/:category_name', function(req, res){
	category_name = req.params.category_name;

	get_categories(function(photo_categories){
		if (!photo_categories[category_name]){
			res.locals = {found: false,
						  category_name: category_name,
						  source_url: null,
						  url: null
						};
			res.render('random.ejs');						
		} else {
			get_random_pic(category_name, function(found, source_url, url){
				res.locals = {
					found: found,
					category_name: category_name,
					source_url: source_url,
					url: url};
				res.render('random.ejs');							
			});
		}
	});
});