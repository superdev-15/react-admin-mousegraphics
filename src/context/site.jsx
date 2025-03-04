import React, { useContext, createContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { UNSAFE_NavigationContext as NavigationContext, useParams } from "react-router-dom";
import { setup } from "axios-cache-adapter";
import { useAuth } from "./auth";

// global site settings
const siteContext = createContext();
export function SiteContext({ children }) {
	const site = useSiteContext();
	return <siteContext.Provider value={site}> { children } </siteContext.Provider>
}
export const useSite = () => useContext(siteContext);

// site context/utilities
function useSiteContext() {
    // apply global values settings here
    // TODO centralize ids and url
    let site_config = {
        showPreloader: false,
        sidebarState: localStorage.getItem("sidebar-state") ? localStorage.getItem("sidebar-state") : "expanded",
        documentTitle: document.title
    }
    let auth = useAuth();
	const [siteConfig, setSiteConfig] = useState(site_config);

    // update config
    const useUpdateSiteConfig = (key, value) => {
        site_config[key] = value;
        setSiteConfig(site_config);
    };

    // get previous state
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
          	ref.current = value;
        });
        return ref.current;
    };

    // get nested object
    const useGetNestedObject = (schema, key) => { 
        let key_list = key.split(".");
        let len = key_list.length;
        for(let i = 0; i < len-1; i++) {
            let el = key_list[i];
            if (!schema[el]) schema[el] = {}
            schema = schema[el];
        }
        return schema[key_list[len-1]];
    }

    // use update effect (useeffect but not trigger on mount)
    // NOTE: discontinued until further notice
    // due to useeffect behavior changes in react 18 strict mode,
    // this may not work as intended
    /*const useUpdateEffect = (effect, deps) => {
        const isFirstMount = useRef(true);
        useEffect(() => {
            if (!isFirstMount.current) effect();
            else isFirstMount.current = false;
        }, deps);
    }*/

    // debounce
    const useDebounce = (value, delay = 500) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
              	setDebouncedValue(value);
            }, delay);
            return () => {
              	clearTimeout(handler);
            };
        },[value, delay]);
        return debouncedValue;
    }

	// update nested object
    const useUpdateObject = (object, path, value) => {
        let schema = object;  
        let p_list = path.split(".");
        let len = p_list.length;
        for(let i = 0; i < len-1; i++) {
            let elem = p_list[i];
            if( !schema[elem] ) schema[elem] = {}
            schema = schema[elem];
        }
        schema[p_list[len-1]] = value;
        return schema;
    }

	// set document title
	const useDocumentTitle = (title) => {
		document.title = title ? title + " - " + site_config.documentTitle : site_config.documentTitle;
	}

    // table sorting
    const useSortableData = (items, config = null) => {
        const [sortConfig, setSortConfig] = useState(config);
        const sortedItems = useMemo(() => {
            let sortableItems = items ? [...items] : [];
            if (sortConfig !== null) {
                sortableItems.sort((a, b) => {
                    let key_a = (sortConfig.type == "number") ? Number(useGetNestedObject(a, sortConfig.key)) : useGetNestedObject(a, sortConfig.key);
                    let key_b = (sortConfig.type == "number") ? Number(useGetNestedObject(b, sortConfig.key)) : useGetNestedObject(b, sortConfig.key);
                    if (key_a < key_b) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (key_a > key_b) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    } 
                    return 0;
                });
            }
            return sortableItems;
        }, [items, sortConfig]);
      
        const requestSort = (key, type) => {
            let direction = "ascending";
            if (
                sortConfig &&
                sortConfig.key === key &&
                sortConfig.direction === "ascending"
            ) {
                direction = "descending";
            }
            setSortConfig({ key, direction, type });
        };
      
        return { sorteditems: sortedItems, requestSort, sortConfig };
    };
    
    /**
     * These hooks re-implement the now removed useBlocker and usePrompt hooks in "react-router-dom" v6.
     */
    /**
     * Blocks all navigation attempts. This is useful for preventing the page from
     * changing until some condition is met, like saving form data.
     */
    const useBlocker = (blocker, when = true, modal) => {
        const { navigator } = useContext( NavigationContext );
        useEffect( () => {
            if (!when) return;
            const unblock = navigator.block( ( tx ) => {
                const autoUnblockingTx = {
                    ...tx,
                    retry() {
                        unblock();
                        tx.retry();
                    },
                };

                blocker( autoUnblockingTx );
                //modal({type: "leave-screen"});
            } );

            return unblock;
        }, [ navigator, blocker, when ] );
    }
    /**
     * Prompts the user with an Alert before they leave the current screen.
     */
    const usePrompt = (message, when = true, modal) => {
        const blocker = useCallback(
            ( tx ) => {
                if (window.confirm(message)/*when*/) tx.retry();
            },
            [message]
        );
        useBlocker( blocker, when );
    }

    // api call with cache support
    // setup cache config
    const api = setup({
        cache: {
            maxAge: 86400000, // 24 hours
            exclude: {
                query: false
            }
        }
    });
    // init api call
    const useAxios = (url, method, payload, callback, cacheConfig, axiosConfig) => {
        let data = null;
        let error = "";
        // let { language } = useParams("language");
        url = new URL(window.location.origin + url.replace(/\s+/g, "").replace(/\&$/, ""));
        api({
            data: payload,
            method,
            url,
            headers: { 
                Auth: auth.user.token,
                "Content-Type": "application/json" 
            },
            // override instance config with per request options
            cache: cacheConfig,
            ...axiosConfig
        }).then(async (response) => {
            data = response?.data;
            //await console.log("cache", JSON.stringify(cache.store)); 
            //await localStorage.setItem("cache",JSON.stringify(cache.store));
            // xpr returns non-object value if there"s an error 
            if (callback) {
                if (typeof data === "object" || Array.isArray(data)) {
                    callback({data, error}); 
                } else {
                    callback({data: ""}, {error: data});
                    console.warn(url, data);
                }
            }
            if (data?.invalid_token) window.location.replace("/dashboard/sign-in");
        }).catch(function (error) { 
            if (error.response) {
                // server responded with a status code that falls out of the range of 2xx
                if (callback) callback({data: ""}, {error: error.response.status + " " + error.response.statusText, status: error.response.status});
            } else if (error.request) {
                // The request was made but no response was received
                console.warn(url, error);
            } else {
                // something happened in setting up the request that triggered an error
                console.warn(url, error);
            }
            if (callback) callback(error); 
        });
    };

    // csv download
    const useDownloadCSV = function(data, file_name) {
        let csv = "";
        let items = data;
        for (let row = 0; row < items.length; row++) {
            let keysAmount = Object.keys(items[row]).length;
            let keysCounter = 0;
            let first_row = "";
            
            if (row === 0) {
                for (let key in items[row]) { 
                    let column  = items[row][key];
                    column = (column) ? column.toString().replace(/,/g, " ") : "";
                    column = (column) ? column.toString().replace(/\r\n/g, " ") : "";
                    csv += key + (keysCounter+1 < keysAmount ? "," : "\r\n" );
                    let first_row_key = column + (keysCounter+1 < keysAmount ? "," : "\r\n" );
                    first_row += first_row_key;
                    keysCounter++;
                }
                csv+=first_row;
            } else {
                for (let key in items[row]) { 
                    let column  = items[row][key];
                    column = (column) ? column.toString().replace(/,/g, " ") : "";
                    column = (column) ? column.toString().replace(/\r\n/g, " ") : "";
                    csv += column + (keysCounter+1 < keysAmount ? "," : "\r\n" );
                    keysCounter++;
                }
            }
            
            keysCounter = 0;
        }
        
        let link = document.createElement("a");
        link.id = "download-csv";
        link.setAttribute("href", "data:text/csv; charset=utf-8," + encodeURIComponent(csv));
        link.setAttribute("download", file_name);
        document.body.appendChild(link);
        link.click();
    }

    return { siteConfig, useUpdateSiteConfig, usePrevious, useGetNestedObject, useDebounce, useUpdateObject, useDocumentTitle,
            useSortableData, usePrompt, useAxios, useDownloadCSV };
}