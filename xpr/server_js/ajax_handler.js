// ajax handler: element
const xpr_objects = require("/xpr/request");
const library = require("./library");
const xpr_utils = require("/xpr/utilities");

exports.process = function(context, options) {
    var api = xpr_objects.XprApi;
    let request = xpr_objects.XprRequest();
    let jsonData = request.body ? JSON.parse(request.body) : {};
    let response = {};
    xpr_utils.XprConsole.log("auth: ", jsonData);
    switch (jsonData.action) {
        // auth: login
        case "login":
            try {
                // get token
                response = api({
                    uri: "/auth/login",
                    method: "POST",
                    data: {
                        UserLogin: jsonData.UserLogin,
                        UserPassword: jsonData.UserPassword,
                        TwoFactorCode: jsonData.TwoFactorCode,
                        UserType: "token"
                    }
                });
                xpr_utils.XprConsole.log("response: ", response);
                // get basic user info
                let user = api({
                    uri: "/users/",
                    method: "GET",
                    params: { 
                        _noUnhydrated: 1,
                        with: "CustomFields",
                        Username__eq: jsonData.UserLogin 
                    }
                })
                xpr_utils.XprConsole.log("user: ", user);
                // curently use ProfileImage cf
                let profile_image = user[0]._embedded.CustomFields._embedded ? user[0]._embedded.CustomFields._embedded.ProfileImage : {};
                let user_obj = {
                    Id: user[0].Id,
                    FirstName: user[0].FirstName,
                    LastName: user[0].LastName,
                    Username: user[0].Username,
                    City: user[0].City,
                    _embedded: {
                        CustomFields: { _embedded: { ProfileImage: profile_image } }
                    } 
                }
                response.user = user_obj;

                // since fe login does not return token, we need to find it
                let fe_user_tokens = api({
                    uri: "/auth/tokens/",
                    parseHAL: false,
                    method: "GET",
                    params: {
                        related_User_Id__eq: user[0].Id,
                        select_fields: "Expiry,Token",
                        order_fields: "Expiry",
                        order_dirs: "DESC",
                        per_page: 1
                    }
                });
                xpr_utils.XprConsole.log("fe_user_tokens: ", fe_user_tokens);
                if (fe_user_tokens.Total > 0) {
                    let last_fe_user_token = fe_user_tokens._embedded.Token[0];
                    let expiry = (new Date(last_fe_user_token.Expiry)).toISOString();
                    let today = (new Date()).toISOString();
                    if ((Date.parse(expiry) >= Date.parse(today))) 
                        response.data = '{"status": "SUCCESS", "token": "' + last_fe_user_token.Token + '"}'; 
                    else 
                        response.data = '{"status": "FAILED", "error": "invalid/expired token."}';
                } else {
                    response.data = '{"status": "FAILED", "error": "token not found."}';
                }
            } catch(error) {
                response.error = error.status;
                return response;
            }

            return response;
        break;

        // auth: logout
        case "logout":
            // delete token
            var token = api({
                uri: "/auth/tokens/",
                method: "GET",
                params: { "Token__eq": request.headers.Auth }
            });
            api({
                uri: "/auth/tokens/"+token[0].Id,
                method: "DELETE"
            });
            // logout
            response = api({
                uri: "/auth/logout",
                method: "GET"
            });
    		return response;
    	break;

        // auth: reset password
        case "resetPassword":
            response = api({
                uri: "/auth/login",
                method: "POST",
                data: {
                    UserLogin: jsonData.UserLogin,
                    action: "reset"
                }
            });
    		return response;
    	break;

        // validate token
        case "checkAuth":
            response = library.checkAuth(request.headers.Auth);
            response.request = request;
            return response;
        break;

        // post data
        case "postData":  
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                method: "POST",
                uri: jsonData.uri,
                data: jsonData.data
            });
            
            return response;
        break;
        
        // put data
        case "putData":  
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                method: "PUT",
                uri: jsonData.uri,
                data: jsonData.data
            });

            return response;
        break;

        // get data
        case "getData":  
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                method: "GET",
                uri: jsonData.uri,
                params: jsonData.params
            });
            
            return response;
        break;

        // delete data
        case "deleteData":  
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                method: "DELETE",
                uri: jsonData.uri
            });    
            
            return response;
        break;

        case "getSections":
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                uri : "/sections/",
                method: "GET",
                params: {
                    related_Parent_Id__: 5063,
                    per_page : 100,
                }
            });

            return response;
        break;

        case "getCategories":
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                uri : "/categories/",
                method: "GET",
                params: {
                    related_Parent_Id__: 216,
                }
            });

            return response;
        break;

        case "getArticles":
            var token = library.checkAuth(request.headers.Auth);
            if (token.error) return token;
            response = api({
                uri : "/articles/",
                method: "GET",
                params: {
                    page: jsonData.params.page,
                    per_page: jsonData.params.perPage,
                    related_Section_Id__eq: jsonData.params.sectionId,
                    related_Language_Id__eq: 1,
                    order_field: 'SortOrder',
                    order_dir: 'ASC'
                }
            });

            return response;
        break;
    }

    return response;
}