const express = require("express");
const cors = require("cors");
const Cheerio = require("cheerio");
const requests = require("requests");
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
let data_arr = [];
let ep_arr = [];
app.get("/:page",(req,res)=>{
const page = req.params.page;
requests("https://mangabuddy.com/latest?page="+page)
.on("data",data=>{
    data_arr = [];
    const $ = Cheerio.load(data);
    $("div.book-detailed-item").each(function(i){
        data_arr.push({
            title:$("div.book-detailed-item > div.meta > div.title > h3 > a").eq(i).text(),
            url:$("div.book-detailed-item > div.meta > div.title > h3 > a").eq(i).attr("href"),
            poster:$("div.book-detailed-item > div.thumb > a > img").eq(i).attr("data-src")
        })
    })
})
res.send(data_arr);
})
app.get("/info",(req,res)=>{
    const url = req.body.url
    requests(url).on("data",data=>{
        data_arr = [];
        const $ = Cheerio.load(data);
        
        $("ul#chapter-list > li").each(function(i){
            ep_arr.push({
                ep_title:$("ul#chapter-list > li > a").eq(i).attr("title"),
                ep_url:$("ul#chapter-list > li > a").eq(i).attr("href")
            })
        })

        data_arr.push({
            title:$("div.name > h1").text(),
            poster:$("div.img-cover > img").attr("data-src"),
            authors:$("div.meta > p > a > span").eq(0).text(),
            status:$("div.meta > p > a > span").eq(1).text(),
            chapters:$("div.meta > p").eq(3).text(),
            summary:$("p.content").text().trim(),
            episodes:ep_arr

        })
    })  
    res.send(data_arr)
})

app.get("/read",(req,res)=>{
    const url = req.body.url;
    requests(url).on("data",data=>{
        data_arr = [];
        const $ = Cheerio.load(data);
        $("div.chapter-image").each(function(i){
            data_arr.push($("div.chapter-image > img").eq(i).attr("data-src"))
        })
    })
    res.send(data_arr);
})

app.get("/search",(req,res)=>{
    let keyword = req.query['q'];
    requests("https://mangabuddy.com/search?q="+keyword).on('data',data=>{
        data_arr = [];
        const $ = Cheerio.load(data);
        $("div.book-detailed-item").each(function(i){
            data_arr.push({
                title:$("div.book-detailed-item > div.meta > div.title > h3 > a").eq(i).text(),
                poster:$("div.book-detailed-item > div.thumb > a > img").eq(i).attr("data-src"),
                url:$("div.book-detailed-item > div.meta > div.title > h3 > a").eq(i).attr('href'),
                summary:$("div.summary > p").eq(i).text()

            })
        })
    })
    res.send(data_arr);
})

app.listen(PORT,()=>console.log('listening!!'))
