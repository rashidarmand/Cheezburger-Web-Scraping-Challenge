const puppeteer = require("puppeteer");
const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	const numberOfPages = 10;

	const targetPages = Array.from({ length: numberOfPages }, (_, i) => {
		let output = { pageNum: `page-${i + 1}` };
		if (i === 0) output.url = "https://icanhas.cheezburger.com/";
		else output.url = `https://icanhas.cheezburger.com/page/${i + 1}`;
		return output;
	});

	const requests = targetPages.map((targetPage) => {
		return async function () {
			try {
				console.log(`Navigating to ${targetPage.pageNum}...`);
				await page.goto(targetPage.url);
				console.log(`Navigation to ${targetPage.pageNum} successful!`);
				console.log(`Fetching ${targetPage.pageNum} post images...`);
				const postImageLinks = await page.$$eval("#nw-center-column .nw-post-asset .resp-media-wrap img", (elements) =>
					elements.map((el) => {
						const src = el.getAttribute("data-src");
						return {
							src,
							fileName: src.split("/").pop(),
						};
					})
				);
				console.log({ [`${targetPage.pageNum}-number-of-links`]: postImageLinks.length });
				console.log(`Saving ${targetPage.pageNum} post images...`);
				await saveImages(postImageLinks, `/images/${targetPage.pageNum}`);
				console.log(`Post images for ${targetPage.pageNum} sucessfully saved!`);
				console.log("=========================================================================================");
			} catch (err) {
				console.error(`Error downloading post images for ${targetPage.pageNum}`);
			}
		};
	});

	for await (let request of requests) {
		await request();
	}

	console.log(`Images from first ${numberOfPages} pages downloaded successfully!`);
	await browser.close();
})();

async function saveImages(images, dirPath) {
	const dir = path.resolve(__dirname + dirPath);
	await mkdirp(dir);

	images.forEach(async (img) => {
		const filePath = `${dir}/${img.fileName}.png`;
		const destination = fs.createWriteStream(filePath);
		const res = await fetch(img.src);
		res.body.pipe(destination);
	});
}
