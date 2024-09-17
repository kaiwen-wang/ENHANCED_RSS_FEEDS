import * as cheerio from 'cheerio';
import * as fs from 'fs';
import RSS from 'rss';

var feed = new RSS({
    title: "Nikkei Asia Top Stories",
    image_url: "https://www.nikkei.com/nikkei_asia/common/img/logo_nikkeiasia_ogp.png",
    site_url: "https://asia.nikkei.com/"
});

const url = 'https://asia.nikkei.com/';

async function scrape() {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const $mostReads = $('.most-read');

    const today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'EST',
        timeZoneName: 'short'
    };
    today.setMinutes(Math.round(today.getMinutes() / 5) * 5);
    today.setSeconds(0, 0);
    const formattedDate = today.toLocaleString('en-US', options);

    let RSSElement = {
        "title": "Nikkei Asia Most Read: " + formattedDate,
        "description": ""
    };

    let mostReadHtml = '<ul class="list-decimal list-inside">';
    let jsonData = {
        date: formattedDate,
        articles: []
    };

    $mostReads.find('.slot--most-read-item').each((index, element) => {
        const $article = $(element).find('.collection-article');
        const href = $article.find('a').attr('href');
        let text = $article.find('a').text().trim();
        const link = `<a href="${url}${href}">${text}</a>`;
        RSSElement.description += `${index + 1}. ${link}<br>`;
        mostReadHtml += `<li class="text-blue-500 hover:text-blue-200">${link}</li>`;

        // Add article data to JSON
        jsonData.articles.push({
            title: text,
            href: `${url}${href}`,
            index: index + 1
        });
    });

    mostReadHtml += '</ul>';

    feed.item(RSSElement);
    let xml = feed.xml();
    fs.writeFile("static/rss/rss_nikkei.xml", xml, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("RSS feed saved");
    });

    fs.writeFile("static/json/nikkei_top_stories.json", JSON.stringify(jsonData, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("JSON data saved");
    });
}

scrape();