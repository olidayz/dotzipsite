# Dot Zip website

A static site with no build step. All the words and images live in two files, which you edit through Pages CMS:

- `content/projects.json`: the projects, in order.
- `content/site.json`: the home headline, status pill, About, contact text and social links.

## One-time setup (about 15 minutes)

### 1. Put the files on GitHub
1. Make a free account at github.com.
2. Click **New repository**, name it `dotzip-site`, choose **Private**, and click **Create**.
3. On the new repo page, click **uploading an existing file**. Drag in everything inside this folder, including the `content` and `assets` folders, then click **Commit changes**.
   - The file `.pages.yml` is hidden on a Mac. In Finder press **Cmd + Shift + .** to show hidden files so you can drag it in too.
   - If it still won't upload, click **Add file > Create new file**, name it `.pages.yml`, paste in the contents of the file, and commit.

### 2. Host it on Netlify
1. Sign in at app.netlify.com with your GitHub account.
2. Go to **Add new site > Import an existing project > GitHub** and pick `dotzip-site`.
3. Leave **Build command** empty and set **Publish directory** to `.`, then click **Deploy**.
4. In the site's **Forms** tab, click **Enable form detection**, then redeploy once (Deploys > Trigger deploy). Contact messages then appear in the **Forms** tab. Turn on email notifications there.
5. Optional: **Domain management > Add a domain** to use your own domain.

From now on, every save in the CMS redeploys the site automatically, usually within a minute.

### 3. Turn on the editor
1. Go to app.pagescms.org and sign in with GitHub.
2. When asked, install the Pages CMS app on the `dotzip-site` repo.
3. Open the repo. You'll see **Projects** and **Site settings** in the sidebar.

## Editing

- **Projects:** reorder by dragging, and add or delete projects.
  - **Main image** is the tile and the window hero. Upload one and the placeholder art disappears.
  - **Case study** is a list of blocks: Big statement, Paragraph, Image (with caption), YouTube video, and Link button. Add, remove and drag them into order.
  - **Link name** is what goes after `#` in a share link, e.g. `yoursite.com/#ryanair`.
- **Site settings:** the home headline and sub-line, the status pill (with an on/off switch), how many projects load at a time, About text and stats, the contact headline, and social links. A social link only appears in the footer once you fill it in.

Images you upload go into `assets/uploads`.

## Previewing on your computer

The site loads its content from the `content` files, so opening `index.html` directly shows an empty grid. Either look at the Netlify site, or run `npx serve` in this folder and open the address it prints.

## Not using Netlify?

The contact form relies on Netlify Forms. On another host, make a free form at formspree.io and paste its URL into `data-endpoint=""` on the form in `index.html`.
