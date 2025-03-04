const xpr_objects = require("/xpr/request");
const library = require("./library");
const _ = require("/xpr/underscore");

exports.process = function(context, options) {
    var api = xpr_objects.XprApi;
    let request = xpr_objects.XprRequest();
    let jsonData = (() => { try { return JSON.parse(request.body); } catch (error) { throw new Error("Invalid JSON"); } })();
    
    // validate token
    let token = library.checkAuth(request.headers.Auth);
    if (token.error) return token;

    // prep. data before sending to articles api
    // create new or edit existing data based on received json
    let json_data = jsonData.data;

    // create/edit article
    let method = request.urlParams && request.urlParams.id ? "PUT" : "POST";
    let uri = request.urlParams && request.urlParams.id ?  "/articles/" + request.urlParams.id :  "/articles/";
    let article_data = json_data;
    let updated_article = api({
        method: method,
        uri : uri,
        data : article_data
    });

    return updated_article;
}