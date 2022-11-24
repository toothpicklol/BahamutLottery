var id_array = []
var url = "error"
var doc = ""
var num = 0
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn1").onclick = function() { btn1OnClick() };
})
async function btn1OnClick() {
    num = document.getElementById("num").value

    if (num !== "") {
        url = await tapUrl().then(
            results => {
                return results
            },
            fail => {
                return "error"
            });



        url = await getUrlDetail(url).then(
            results => {
                return results
            },
            fail => {
                return "error"
            });


        if (url !== "error") {
            doc = await requestBaha(1, url).then(
                results => {
                    return results
                },
                fail => {
                    return ""
                });
            loopFloor()

        } else {
            alert('請在文章網址按下抽獎鍵');
        }
    } else {
        alert('人數不可為空');
    }
}
async function loopFloor() {

    if (id_array.length == 0) {
        var collection = doc.getElementsByClassName("BH-pagebtnA");
        document.getElementById("info").innerHTML = "ID搜尋請稍後! 注意!頁數越多搜尋越久";
        var page = collection[0].childNodes[collection[0].childNodes.length - 1].innerHTML
        //getID(page)
        //console.log(page)
        var delay = 3000
        if (page > 50) {
            console.log("超過1000樓 啟用超慢速模式保護你的IP不被當成爬蟲")
            delay = 8000
        }


        for (var i = 1; i <= page; i++) {

            (function(ind) {
                setTimeout(async function() {
                    if (ind == 1) {
                        await getID(doc)
                    } else {
                        var pageDoc = await requestBaha(ind, url).then(
                            results => {
                                return results
                            },
                            fail => {
                                return ""
                            });

                        await getID(pageDoc)
                    }
                    if (ind == page) {
                        console.log(uniArray(id_array, "id"))
                        document.getElementById("info").innerHTML = "中獎名單";
                        var node = document.createElement("button");
                        node.className = "button"
                        node.setAttribute("id", "btn2");
                        node.innerHTML = "資格名單";
                        document.getElementById("btnList").appendChild(node);
                        document.getElementById("btn2").onclick = function() { btn2OnClick() };
                        random()
                    }
                }, delay * ind);
            })(i);

        }

    } else {
        document.getElementById("info").innerHTML = "中獎名單";
        random()
    }
}

function uniArray(array, key) {
    var tmpArray = []
    var tmpJson = {}

    array.map(function(data) {
        if (typeof data == 'object') {
            if (!tmpJson[data[key]]) {
                tmpJson[data[key]] = true
                tmpArray.push(data)
            }
        } else {
            if (tmpJson[data]) {
                tmpJson = true
                tmpArray.push(data)
            }

        }

    })
    return tmpArray
}

function getID(doc) {

    var author = doc.getElementsByClassName("c-post__header__author")
    for (var i = 0; i < author.length; i++) {
        var authorName = author[i].childNodes[3].innerHTML
        var authorID = author[i].childNodes[5].innerHTML
        var floor = author[i].childNodes[1].innerHTML
        var json = { "id": authorID, "name": authorName, "floor": floor }
        id_array.push(json)
    }
}

function requestBaha(defaultPage, url) {
    return new Promise(function(resolve, reject) {
        const req = new XMLHttpRequest();
        const baseUrl = url;
        const urlParams = `&page=${defaultPage}`;
        req.open("POST", baseUrl + urlParams, true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send();

        req.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                //console.log("Got response 200!");
                var html = this.responseText
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");
                resolve(doc);
            }
        }

    });
}

function tapUrl() {
    return new Promise(function(resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, async function(tab) {
            //Be aware that `tab` is an array of Tabs 
            //console.log(tab[0].url);
            url = tab[0].url
            resolve(url);
        });
    });
}

function getUrlDetail(url) {
    return new Promise(function(resolve, reject) {
        try {
            var data = url.split("?")
            var tmp = data[1].split("&")
            console.log(data)

            if (tmp.length >= 2) {
                var bsn = tmp[0].split("=")
                var snA = tmp[1].split("=")

                if (bsn[0] == "bsn" && snA[0] == "snA") {

                    console.log("bsn=" + bsn[1])
                    console.log("snA=" + snA[1])
                    url = `${data[0]}?bsn=${bsn[1]}&snA=${snA[1]}`
                    resolve(url);
                } else {
                    reject("error");
                }
            } else {
                reject("error");
            }
        } catch (e) {
            reject("error");
        }
    });
}

function btn2OnClick() {
    document.getElementById("scroll").innerHTML = "";
    document.getElementById("info").innerHTML = "資格名單";

    for (var i = 0; i < id_array.length; i++) {
        var tmp = divProcess(i)
        document.getElementById("scroll").innerHTML += tmp
    }
}

function random() {
    document.getElementById("scroll").innerHTML = "";

    if (num > id_array.length || num <= 0) {
        alert("人數錯誤 請檢察資格名單人數")
    } else {
        for (var i = 0; i < num; i++) {
            var luck = getRandomInt(id_array.length)
            var tmp = divProcess(luck)
            document.getElementById("scroll").innerHTML += tmp
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getCookies(domain, name, callback) {
    chrome.cookies.get({ "url": domain, "name": name }, function(cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}

function divProcess(i) {
    var id = id_array[i].id
    var tmpID = id.toLowerCase()
    var tmp = `
        <div class="list">
            <a class="userImg">
                    <img  src="https://avatar2.bahamut.com.tw/avataruserpic/${tmpID[0]}/${tmpID[1]}/${tmpID}/${tmpID}_s.png">
                </a>
                <div class="info">
                    <a class="user">${id_array[i].name}</a>
                    <div class="footer">
                        <div style="margin-right:6px;">${id_array[i].floor}    ${id}</div>                                              
                    </div>
                </div>
        </div>`

    return tmp
}