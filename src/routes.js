export const AllRoutes = {
    Home: { path: "/dashboard/" },
    Start: { path: "/__xpr__/pub_engine/admin-react-build/web" },

    Dashboard: { path: "/dashboard/list" },
    
    Login: { path: "/dashboard/sign-in" },
    NotFound: { path: "/dashboard/404" },
    ServerError: { path: "/dashboard/500" },
    Add: { path: "/dashboard/articles/add/:section_id" },
    Edit: { path: "/dashboard/articles/edit/:section_id/:article_id" },
}