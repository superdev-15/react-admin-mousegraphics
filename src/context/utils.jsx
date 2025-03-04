import React, { useContext, createContext, useState } from "react";


// global utils for charts
const utilsContext = createContext();
export function UtilsContext({ children }) {
	const utils = useUtilsContext();
	return <utilsContext.Provider value={utils}> { children } </utilsContext.Provider>
}
export const useUtils = () => useContext(utilsContext);

// utils context/utilities
function useUtilsContext() {
    // apply global values settings here
    let utils_config = {}
	const [utilsConfig, setUtilsConfig] = useState(utils_config);

    // update config
    const useUpdateConfig = (value) => {
        setUtilsConfig(value);
    };

    // number formatter eg. 1K, 2.5M etc.
    const nFormatter = (num, digits) => {
        let si = [{ value: 1, symbol: "" },{ value: 1E3, symbol: "K" },{ value: 1E6, symbol: "M" },{ value: 1E9, symbol: "G" },{ value: 1E12, symbol: "T" },{ value: 1E15, symbol: "P" },{ value: 1E18, symbol: "E" }];
        let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) break;
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }

    // format number with commas separated
    const numberWithCommas = (x) => {
        return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    }

    // date difference. Returns {days, months, years}
    const getDateDifference = (date1, date2)=>{
        let diff = Math.abs(date1.getTime() - date2.getTime());
        let res = {
            days: diff / (1000 * 60 * 60 * 24),
            months: diff / (1000 * 60 * 60 * 24 * 30),
            years: diff / (1000 * 60 * 60 * 24 * 360)
        }
        return res;
    }

    // truncate long url
    const shortString = (s, l, reverse) => {
        let stop_chars = [' ','/', '&'];
        let acceptable_shortness = l * 0.80;
        reverse = typeof(reverse) != "undefined" ? reverse : false;
        s = reverse ? s.split("").reverse().join("") : s;
        let short_s = "";
        for(let i=0; i < l-1; i++){
            short_s += s[i];
            if(i >= acceptable_shortness && stop_chars.indexOf(s[i]) >= 0){
                break;
            }
        }
        if(reverse){ return short_s.split("").reverse().join(""); }
        return short_s;
    }
    const shortUrl = (url, l) => {
        l = typeof(l) != "undefined" ? l : 50;
        let chunk_l = l; /*(l/2)*/
        // remove domain name
        url = url.replace(/^(?:http|https|rtsp)\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/,"/");
        if(url.length <= l){ return url; }
        let start_chunk = shortString(url, chunk_l, false);
        let end_chunk = shortString(url, chunk_l, true);
        return /*start_chunk + */"..." + end_chunk;
    }

    // hh:mm:ss
    const toHHMMSS = (seconds) => {
        return new Date(seconds * 1000).toISOString().slice(11, 19);
    }

    return { utilsConfig, useUpdateConfig, nFormatter, numberWithCommas, getDateDifference, shortUrl, toHHMMSS };
}