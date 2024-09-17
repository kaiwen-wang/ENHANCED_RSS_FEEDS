import * as cheerio from 'cheerio';
import * as fs from 'fs';
import RSS from 'rss';

var feed = new RSS({
    title: "Hacker News Top Stories",
    image_url: "https://news.ycombinator.com/y18.svg",
    site_url: "https://news.ycombinator.com/"
});

const url = 'https://news.ycombinator.com/';

async function scrape() {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

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
        "title": "Hacker News Top Stories: " + formattedDate,
        "description": ""
    };

    let topStoriesHtml = '<ol class="list-decimal list-inside">';
    let jsonData = {
        date: formattedDate,
        articles: []
    };

    $('.athing').each((index, element) => {
        const $title = $(element).find('.titleline > a');
        const href = $title.attr('href');
        let text = $title.text();
        const $subtext = $(element).next().find('.subtext');
        const points = $subtext.find('.score').text();
        const comments = $subtext.find('a').last().text();

        const link = `<a href="${href}">${text}</a>`;
        const details = `${points} | ${comments}`;

        RSSElement.description += `${index + 1}. ${link} (${details})<br>`;
        topStoriesHtml += `<li class="text-blue-500 hover:text-blue-200">${link} <span class="text-gray-500">(${details})</span></li>`;

        // Add story data to JSON
        jsonData.articles.push({
            title: text,
            href: href,
            points: points,
            comments: comments,
            index: index + 1
        });
    });

    topStoriesHtml += '</ol>';
    feed.item(RSSElement);
    let xml = feed.xml();

    // Save RSS feed
    fs.writeFile("static/rss/rss_hn.xml", xml, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("RSS feed saved");
    });

    // Save JSON data
    fs.writeFile("static/json/hn_top_stories.json", JSON.stringify(jsonData, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("JSON data saved");
    });
}

scrape();