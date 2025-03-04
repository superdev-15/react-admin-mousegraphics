const xpr_objects = require("/xpr/request");
const api = xpr_objects.XprApi;
const _ = require("/xpr/underscore");
const xpr_utils = require("/xpr/utilities");
const www = xpr_objects.XprWeb;

// check authentication
exports.checkAuth = function checkAuth(accessToken) {    
    let token = api({
        uri: "/auth/tokens/",
        method: "GET",
        params: { "Token__eq": accessToken }
    });
    if (!token.length) return { error: "token not found."};
    let expiry = (new Date(token[0].Expiry)).toISOString();
    let today = (new Date()).toISOString();
    return ((Date.parse(expiry) >= Date.parse(today) && token.length)) ? { status: "valid token." } : { error: "invalid/expired token." };
}

// get pagination
exports.pagination = function pagination(data) {
    // for collections with "collectionFormat" set to "hal"
    let total_items = data.total || 0;
    let pagination = {};
    let per_page = data.per_page || 10;
    let page = Number(data.page) || Number(1);
    pagination.totalPages = Math.ceil(total_items / per_page);
    if (page < pagination.totalPages) pagination.nextPage = page+1;
    if (page > 1) pagination.prevPage = page-1;
    return pagination;
}