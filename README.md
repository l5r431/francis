# St. Francis High School Namagoma: school website

A 7-page, multi-file site for a made-up school for ages 2 to 11.
All names, numbers and quotes are invented. Replace them with your own.

## Run it
Open `index.html` in a browser. No build step. (Fonts load from Google Fonts when online.)
The contact forms only send once the site is online and Formspree is connected (see js/main.js).

## Files
Every page has its own HTML, CSS and JS. `base.css` and `main.js` are shared.

| Page | CSS | JS |
|---|---|---|
| index.html | home.css | home.js |
| about.html (About and News) | about.css | about.js |
| academics.html (Learning) | academics.css | academics.js |
| life.html | life.css | life.js |
| admissions.html | admissions.css | admissions.js |
| contact.html | contact.css | contact.js |

Folders: `css/`, `js/`, `img/` (image slots), `frames/` (hero video frames), `tools/` (frame extractor).

## Phone version of the hero video
The home page has two sets of frames and uses the one that fits the screen:
- `frames/` = WIDE frames, for computers, laptops and phones turned sideways.
- `frames-mobile/` = TALL frames, for phones held upright (any screen whose hero panel is taller than it is wide).
Only the set that is needed is downloaded, and if you turn the phone the page switches sets.

To make the phone set, record or export a PORTRAIT video (about 9:16, for example 720 x 1280, with the important action
in the middle, because tall phones trim a little from the top and bottom), then run:
`python tools/extract_frames.py my-phone-video.mp4 --mobile`
Optional: `python tools/extract_frames.py my-phone-video.mp4 20 720 --mobile` (frames per second, width).
This fills `frames-mobile/` and rewrites `frames-mobile/manifest.js`. The two sets can have different numbers of frames.
Until `frames-mobile/` has frames (its manifest says `count: 0`), phones use the wide frames and see the whole picture
along the bottom of the hero.

## The scroll-scrubbed hero video (home page)
The hero is a section a little taller than the screen, with a pinned panel inside it (about 2.6 screens of scrolling; change `height` on `.hero` in css/home.css to make the video slower or faster). A `<canvas>` shows one video frame at a time.
Scroll position picks the frame, so scrolling down plays it forwards and scrolling up plays it backwards.
The headline fades out partway so the video can play on its own.

The frames in `frames/` are a SAMPLE animation. To use your own video:
1. Install ffmpeg (https://ffmpeg.org/download.html). Check that `ffmpeg -version` works in a terminal.
2. From this folder run:   `python tools/extract_frames.py my-video.mp4`   (add `--mobile` for the phone set, see above)
   Optional: `python tools/extract_frames.py my-video.mp4 20 1280`  (frames per second, width)
3. Open `index.html` and scroll. The script writes `frames/frame_0001.jpg ...` and `frames/manifest.js`.

Tips
- Keep the clip short (3 to 10 seconds). 24 fps for 4 seconds is about 100 frames.
- Aim for under about 15 MB of frames in total, so phones can load them. Lower fps or width if needed.
- If your video is dark, add the class `hero--dark` to `<section class="hero" ...>` in index.html to get light text.
- With no phone frames yet, phones held upright show the whole wide picture along the bottom of the hero (nothing is cropped) and its
  top edge is stretched upwards to fill the space above. `TALL_BELOW` in js/home.js sets what counts as a "tall" screen.
- If `frames/manifest.js` is missing or the frames fail to load, the page falls back to the drawn SVG scene.
- People who prefer reduced motion get one still frame and no pinning.

## About page (about.html): story, people and news in one page
One long page with a sticky sub-menu (Our story, How we teach, Management, Teachers, Prefects, Class leaders,
Campuses, News, Events, Newsletter). It holds everything that used to be on three separate pages:
- **About:** our story, how we teach, who looks after your child, campuses, safeguarding, community, questions.
- **People:** management team and governors, all teachers (filter by group, search by name or subject), prefects,
  class leaders and monitors for every class (pick a class from the menu), and how these roles are chosen.
- **News:** news filter and search, events, newsletter archive and the newsletter sign-up form.

The scripts for all of this are in js/about.js (the class-leader data is at the top of that part). The sub-menu
highlight is shared code in js/main.js. Links to the news section use `about.html#news`, and links to the people use
`index.html#management`. All names are invented.

Real-school note: before showing real children's names or photos online, get written parental consent, and follow
your school's safeguarding policy. This sample shows pupils by first name only.

## Animations on every page
- Content fades and slides in as you scroll (elements marked `data-reveal="up|left|right|zoom"`, with
  `data-delay="1..4"` to stagger neighbours). The code is the "Animations on every page" block in js/main.js
  and the matching CSS at the end of css/base.css.
- Each page title banner has an image that drifts slower than the page (parallax).
- Section headings draw a short yellow line under themselves.
- Photos zoom gently and cards lift with a soft shadow on hover.
- Pages fade in, and fade out before you go to another page.
- The home page adds the scroll-scrubbed hero video, word-by-word intro, side dots and a swipeable "day" strip.
- Everything switches off for visitors who choose "reduce motion" in their system settings.

## Floating navigation bar
The header is a floating bar: 10px from the top of the screen, with rounded ends and a soft shadow. It stays on screen
as you scroll. The numbers are at the top of css/base.css (`--nav-top`, `--nav-h`, `--nav-gap`, `--nav-radius`).
`--nav-radius` is 30px. On phones (980px wide and under) the bar is only 5px from each side of the screen (`--nav-side`),
and the school crest (images/download.jpg) stays next to the school name.
The home page's pinned panels and the About page's sub-menu use `--nav-space`, so they follow if you change these.

## Daily colour themes
js/theme.js picks a colour theme from the visitor's day of the week: Monday to Friday each have their own, and Saturday and
Sunday use Monday's. The colours are plain variables in css/base.css (`html[data-theme="tue"]` and so on; Monday is `:root`).
To change a day's colours, edit those variables. To preview a day without waiting, add `?theme=tue` (`mon`, `tue`, `wed`,
`thu`, `fri`) to the address; it stays for the rest of that browser tab. The home page's sky-and-hills drawing keeps its own colours.

## Page heroes (every page except home)
Each inner page now has its own hero (the banner under the menu):
- **About:** the original dark banner with the photo drifting behind the title.
- **Learning:** green ruled exercise-book page, photo taped on (`.page-banner--learn` in css/academics.css).
- **Admissions:** yellow, with the four application steps as a path and a rounded photo (`.page-banner--apply`).
- **Book a visit:** pale and centred, round photo, curved bottom edge, "Getting here" button (`.page-banner--visit`).
- **Life:** tall bright photo with quick links to the sections on the page (`.page-banner--life`).
The photos are the same image slots as before (`img/<page>-banner.svg`), so swap in real photos the same way.

## Footer map
Every page's footer has a Google Maps embed in the bottom-right corner. It searches for "Namagoma, Uganda".
To point it at the exact school, find `maps?q=Namagoma%2C+Uganda` in all six HTML files (footer and the
"Open in Google Maps" link) and replace the part after `q=` with your address, written with `+` for spaces.
The map needs an internet connection.

## Photo gallery (Life page)
"Life in pictures" (`#gallery` in life.html) is a grid of nine photos; the first one is shown large. Tapping a photo opens it
full screen in a viewer (a `<dialog>`): swipe, tap the arrows or use the left/right keys to move on, and Escape, the X or
a tap on the dark area to close. The code is block 4 of js/life.js and the end of css/life.css.
To add a photo, copy one `<li>` in the gallery list and change the `src`, `alt`, `data-caption` and the caption text.
To open a bigger picture than the thumbnail, add `data-full="img/your-big-photo.jpg"` to that photo's `<button>`.

## Floating buttons (every page)
Bottom right of every page (block at the end of js/main.js, CSS at the end of css/base.css):
- **Reading progress bar:** a thin line along the top of the screen that fills as you scroll.
- **Back to top:** appears after a screenful of scrolling.
- **Contact button:** opens "Chat on WhatsApp" and "Call the school".
**Set the real number** on the `SCHOOL_PHONE` line at the top of that block (digits only, with the country code, no + or spaces).
The one in the file is a placeholder copied from the footer.

## Install as an app and work offline
The site can be installed on a phone or computer (Chrome and Edge show an "Install the app" button in the footer; on an iPhone
or iPad the footer explains Share, then Add to Home Screen) and opened with no signal. After a visitor has opened the site once:
- the pages, styles and scripts are saved on their phone (`sw.js`), and the pictures and video frames are saved as they are viewed;
- a page they have not opened yet still opens, with its text, but its pictures may be missing until they have signal again;
- the map, the contact forms and the WhatsApp button need signal, and a small "You're offline" notice appears at the top.

Things to know:
- It only works on a real website address starting with `https://` (or `localhost` while testing). Opening `index.html` from
  your computer does not use it.
- **Every time you publish changes, add 1 to `VERSION` at the top of `sw.js`** (`stfrancis-v1` becomes `stfrancis-v2`), so visitors'
  phones throw away old pictures and frames. Pages, CSS and scripts also refresh by themselves when there is signal.
- If you add a new page, list it in `SHELL_FILES` in `sw.js`, and run `python tools/set_domain.py` as before.
- The app name, icons and colours are in `site.webmanifest`. The icons are in `images/`.
- `offline.html` is the page shown when someone opens a page that has not been saved and has no signal.

## Background, clock card, straw (css/fx.css, js/fx.js, js/straw.js)
- **Lined, smoky background (every page):** a fixed layer behind the content with faint ruled lines and slow falling smoke.
  It uses gradients and `transform` only, so it is cheap. It switches itself to still (no animation) for "reduce motion",
  Data Saver, 2G connections and phones with 2 GB of memory or less (`fx-lite` in js/fx.js).
- **Date and time card (every page):** sits in the page flow just under the navbar (`position: static`), shows a greeting for
  the visitor's own time of day (morning, afternoon, evening, night, and after midnight), their date and a live clock.
  The X closes it for the rest of the browser session. Edit the messages in the `PARTS` list at the top of js/fx.js.
- **Fonts:** Syne for headlines (h1, h2) and Caveat for the motto and the greeting. Change `--cool` and `--script` in css/fx.css.
- **Straw (home page only):** js/straw.js draws a see-through straw down the middle of the page, flat in some places and bending in
  others (edit `PATTERN`). Water fills it as you scroll; the tip stays level with the middle of the screen. `z-index: 9999`,
  and it never blocks clicks. Switched off for "reduce motion".
- **Lazy images:** every `<img>` has `loading="lazy"`; images added by scripts get it automatically (js/fx.js).
- The falling stars/books and their bottom-left button were removed.

## How the code is written
The HTML and CSS are written vertically so they are easy to read and learn from:
- CSS: one selector per line and one declaration per line, long values broken over several lines.
- HTML: one tag per line, nested tags indented, and long attribute lists split one attribute per line.

## Spacing
Space between sections is controlled in one place: `--section` at the top of css/base.css. Make the number smaller
for tighter pages, larger for airier ones.

## Image slots (all pages except home)
Every other page has image placeholders. `img/IMAGE-LIST.txt` lists every slot, its size and what it should show.
To use a real photo: save it in `img/` (for example `img/about-story.jpg`), then change the `src` in the HTML
from `img/about-story.svg` to `img/about-story.jpg`. Keep the `width` and `height` attributes the same shape (ratio),
and write a useful `alt` description. Each page also has a wide banner slot (`img/<page>-banner.svg`)
that sits behind the page title.

## Mobile menu
On narrow screens the menu button is three lines that animate into an X. The panel slides down and the links
appear one after another. It closes on Escape, on a tap outside, or when you choose a link. See `.nav-toggle` in
css/base.css and the first block of js/main.js.

## SEO, favicons and going live
What is in place on every page: a unique title and description, a canonical link, `robots` meta, Open Graph and
Twitter tags (so links look good when shared), structured data (JSON-LD: school, website, page, breadcrumbs),
`lang="en-GB"`, one `<h1>` per page, and alt text on images. The tab icon, Apple icon and web app manifest are linked
from every page. `robots.txt` and `sitemap.xml` are in the site root.

Before you publish:
1. Set your real address: `python tools/set_domain.py https://www.yourdomain.com`
   (this updates the canonical links, share tags, structured data, robots.txt and sitemap.xml).
2. Replace the invented details in the structured data and on the pages (address, phone, opening hours, school name).
   Search engines show what you give them, so it must be true.
3. Replace `img/social-share.jpg` (1200 x 630) with your own picture, and the icon files if you want another logo:
   `favicon.svg`, `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
4. Upload the files so that `robots.txt` and `sitemap.xml` sit at the top level of the domain. You do not need the `tools/` folder online.
5. Add 1 to `VERSION` in `sw.js` each time you publish changes (see "Install as an app and work offline").
6. In Google Search Console (search.google.com/search-console): add your site, verify it, submit `sitemap.xml`,
   and use "URL inspection" on the home page to ask for indexing.

Good to know: these tags help Google find and describe your pages, but they do not guarantee a position in results.
Ranking depends mostly on real, useful content and on other sites linking to yours, and a new site can take days or
weeks to appear. Tab icons show at once in browsers, but Google can take longer to show the icon in search results.
If you edit titles or descriptions, change them in every page's `<head>` (they must stay unique per page), and update `lastmod` in the sitemap.

## Forms
All three forms send through Formspree. Set `FORMSPREE_URL` once in js/main.js.

## Good next steps
1. Swap placeholder text and images for your own project's content.
2. Move the repeated header/footer HTML into a template or a static site generator.
3. Compress your photos (for example to WebP) before adding them.


## Placeholders to replace with real school details
This site was converted from a kindergarten template into a S.1 to S.6 day and boarding high school site. These are made-up and should be replaced:
- Staff, prefect, governor and class-leader names (the home page, and the class leaders in js/people.js)
- The school history dates under "Our story" (about.html)
- Figures on the home page and the "Progress at a glance" bars (academics.html)
- Upcoming and finished events (about.html, "News and events")
- Phone numbers, and the photo placeholders listed in img/IMAGE-LIST.txt

## Where things live now
- Home page, right after the welcome message: Management (8 people, static), Teachers and Prefects (self-moving carousels) and Class leaders. Their styles are in css/people.css and their script in js/people.js.
- "A day at St. Francis" (the pinned, sideways-scrolling day) is on the Life page (#day); its styles are at the end of css/life.css and its script is in js/life.js.
- The fee estimator has been removed from the Admissions page.
- Navigation: each main menu item has a dropdown that opens on hover or keyboard focus (styles in css/base.css, under "dropdown menus"). On phones the dropdowns are hidden and the menu works as before.
