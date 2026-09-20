# Christian Powlette - Portfolio

Static site: HTML, CSS and JavaScript only. No build step.

    index.html
    case-studies/         three sanitized case-study pages
    assets/css/styles.css colour tokens, layout, components, print styles
    assets/js/main.js     nav, copy button, contact form, QR codes (edit CONFIG at the top)
    assets/docs/          resume PDF used by the download buttons and the resume QR code

## Before publishing
1. Edit `CONFIG.siteUrl` in `assets/js/main.js` to the public address (for example https://USERNAME.github.io/portfolio/). The QR codes stay blank until it is set or the site is served over http(s).
2. Confirm the email and LinkedIn URL in `index.html` (Contact section).
3. Replace `assets/docs/Christian_Powlette_Resume.pdf` if the resume changes.
4. Review the skill dots in the Skills section so they match how you have actually used each tool.

## GitHub Pages
Push this folder to a repository, then Settings > Pages > Deploy from branch (main, root).

## Offline backup
Open the page in a browser and use Print > Save as PDF. Print styles are included.
