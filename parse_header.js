const fs = require('fs');

const html = fs.readFileSync('header_dump.html', 'utf8');

// Extract all style blocks
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
fs.writeFileSync('header_styles.css', styles);

// Extract elements and text
const links = [...html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({
  href: m[1],
  text: m[2].replace(/<[^>]+>/g, '').trim()
}));

// Extract images
const imgs = [...html.matchAll(/<img[^>]*src="([^"]*)"[^>]*>/gi)].map(m => m[1]);

console.log('Images:', imgs);
console.log('Links count:', links.length);
console.log('Links:', links.filter(l => l.text));
