# Cheezburger Web Scraping Challenge

## Challenge

> For the first 10 pages of [I Can Has Cheezburger](https://icanhas.cheezburger.com/):
> Write the fetured image of each post in the feed to disk.

## My approach

- For each page:
  - Use Puppeteer to scrape site and grab the target image elements
  - Map the images into an object with the image source and file name
  - Fetch each image source and save it an images folder in a directory titled `page-{number}`
