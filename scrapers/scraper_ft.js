import * as cheerio from 'cheerio';
import * as fs from 'fs';
import RSS from 'rss';

var feed = new RSS({
    title: "FT Top Stories",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Financial_Times_corporate_logo_%28alternative%29.svg/1200px-Financial_Times_corporate_logo_%28alternative%29.svg.png",
    site_url: "ft.com"
});

const url = 'https://ft.com';

async function scrape() {
    const res = await fetch(url);


    // const blob = await res.blob();
    // blob.arrayBuffer().then(buffer => {
    //     const uint8Array = new Uint8Array(buffer);
    //     console.log(uint8Array);
    // });


    const html = await res.text();
    console.log(html)
    const $ = cheerio.load(html);
    const $mostReads = $('.o-header__mega-column--articles');
    const $frontRead = $('.list__items-wrapper').first();

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
        "title": "FT Most Read: " + formattedDate,
        "description": ""
    };

    let mostReadHtml = '<ul class="list-decimal list-inside">';
    let jsonData = {
        date: formattedDate,
        articles: []
    };

    $frontRead.find('a').each((index, element) => {
        const href = $(element).attr('href');
        let text = $(element).text();
        text = text.replace('opinion content.', '[Opinion]');
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

    // Save RSS feed
    fs.writeFile("src/lib/rss/rss_ft.xml", xml, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("RSS feed saved");
    });

    // Save JSON data
    fs.writeFile("src/lib/json/ft_top_stories.json", JSON.stringify(jsonData, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("JSON data saved");
    });
}

scrape();