// this returns all xprobjects
const xpr_objects = require("/xpr/request");
const library = require("./library");
const xpr_utils = require("/xpr/utilities");

exports.process = function(context, options) {
    var api = xpr_objects.XprApi;
    let request = xpr_objects.XprRequest();
    let language = request.urlParams.language;
    let category = -1
    // validate token
    let token = library.checkAuth(request.headers.Auth);
    if (token.error) return token;
    
    category = language === "en" ? '125' : '124';

    let articles_params = {
        "order_fields":             "SortOrder",
        "order_dir":                "ASC",
        "related_Section_Id__eq":   5040,
        "related_Category_Id__eq":  category,
        "Active__eq":               "1",
        "with":                     "Picture,CustomFields,Categories"
    }

    let articles = api({
        method: "GET",
        uri: "/articles/",
        parseHAL: false,
        params: articles_params
    });
    let data = articles._embedded.Article
    return data;
}