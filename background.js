if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}

// An object used for caching data about the browser's cookies, which we update
// as notifications come in.
function CookieCache() {
    this.cookies_ = {};
    this.reset = function () {
        this.cookies_ = {};
    };
    this.add = function (cookie) {
        var domain = cookie.domain;
        if (!this.cookies_[domain]) {
            this.cookies_[domain] = [];
        }
        this.cookies_[domain].push(cookie);
    };
    this.remove = function (cookie) {
        var domain = cookie.domain;
        if (this.cookies_[domain]) {
            var i = 0;
            while (i < this.cookies_[domain].length) {
                if (cookieMatch(this.cookies_[domain][i], cookie)) {
                    this.cookies_[domain].splice(i, 1);
                } else {
                    i++;
                }
            }
            if (this.cookies_[domain].length == 0) {
                delete this.cookies_[domain];
            }
        }
    };
    // Returns a sorted list of cookie domains that match |filter|. If |filter| is
    //  null, returns all domains.
    this.getDomains = function (filter) {
        let result = [];
        sortedKeys(this.cookies_).forEach(function (domain) {
            if (!filter || domain.indexOf(filter) != -1) {
                result.push(domain);
            }
        });
        return result;
    };
    this.getCookies = function (domain) {
        return this.cookies_[domain];
    };
}

let cache = new CookieCache();
// Every time a cookie changes.
chrome.cookies.onChanged.addListener(function (info) {
    removeAll();
});

// remove all cookies
function removeAll() {
    let all_cookies = [];
    cache.getDomains().forEach(function (domain) {
        cache.getCookies(domain).forEach(function (cookie) {
            all_cookies.push(cookie);
        });
    });
    cache.reset();
    let count = all_cookies.length;
    for (let i = 0; i < count; i++) {
        this.removeCookie(all_cookies[i]);
    }
    timer.reset();
    chrome.cookies.getAll({}, function (cookies) {
        for (let i in cookies) {
            if (cookies[i].domain === ".medium.com" || cookies[i].domain === "medium.com") {
                cache.add(cookies[i]);
                removeCookie(cookies[i]);
            }
        }
    });
}

// remove a single cookie
function removeCookie(cookie) {
    let url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
        cookie.path;
    chrome.cookies.remove({"url": url, "name": cookie.name});
}


function sortedKeys(array) {
    let keys = [];
    for (let i in array) {
        keys.push(i);
    }
    keys.sort();
    return keys;
}
