# Cabin Beta
> Cabin is a simple and extensible static site generator powered by [Grunt](http://gruntjs.com/).

[![NPM version](https://badge.fury.io/js/cabin.png)](http://badge.fury.io/js/cabin)  
[![Dependency Status](https://gemnasium.com/colinwren/Cabin.png)](https://gemnasium.com/colinwren/Cabin)  
[![Travis Status](https://travis-ci.org/colinwren/Cabin.png)](https://travis-ci.org/colinwren/Cabin)  
# Getting Started

First install cabin globally with the following command:
```bash
npm install -g cabin
```
You can then scaffold a static generator with the following command:
```bash
cabin new <destination folder> [user/repo]
```
The first parameter is the name of the destination folder, and the second is the GitHub username and repository name of a `theme` to use for the site. If the `theme` parameter is left blank, the [default theme](https://github.com/colinwren/testTheme) will be used.

After scaffolding a site generator, you can run it by entering the following command in the destination folder:
```bash
grunt
```
This will build your site, start a static file server, open a browser tab with the site's homepage, and start a watch process to rebuild your site when your source files change. Try editing or creating a new markdown file in the `posts` folder (if you are using the default theme) and upon save your site will be automatically rebuilt. When your site has been rebuilt, your browser will automatically refresh with your updated site.
# Themes
Cabin themes provide styling and structure for your static site project. They work great out of the box and as starting points for more customized sites.

## Featured themes

### [colinwren/Candy](http://colinwren.github.io/Candy/)
![Candy theme](https://raw.github.com/colinwren/Cabin/gh-pages-src/src/images/Candy.png)
### [colinwren/Blok](http://colinwren.github.io/Blok/)
![Blok theme](https://raw.github.com/colinwren/Cabin/gh-pages-src/src/images/Blok.png)

## Creating Themes

### Configuration

The only file explicitly required is a `cabin.json` configuration in the root of the repo. This file describes what CSS preprocessors and template languages that your theme supports as well as the configuration for [grunt-pages](https://github.com/ChrisWren/grunt-pages). We currently support EJS and Jade templates and the Sass and LESS style languages.

Here is an example `cabin.json` file which states that the project supports Sass, Jade, and has the specified config for the grunt-pages task:
```json
{
  "style": [
    "Sass"
  ],
  "template": [
    "Jade"
  ],
  "gruntPages": {
    "posts": {
      "src": "posts",
      "dest": "dist",
      "layout": "src/layouts/post.jade",
      "url": "blog/posts/:title"
    }
  }
}
```
**Note: the configuration of the cabin.json must have `dist` as the destination folder and the theme files must match the folder structure described below.**

### Theme file locations

Your theme must conform to the following folder structure in order to work with the Gruntfile that Cabin generates.
```
├── README.md
├── cabin.json
├── posts
│   └── Sample posts
├── site
│   └── Generated site files
└── src
    ├── images
    │   └── Theme image files
    ├── layouts
    │   └── Theme layout templates
    ├── pages
    │   └── Theme page templates
    └── styles
        └── Theme stylesheets
```

The best way to learn about how to develop a theme is by referencing the [default theme](https://github.com/colinwren/Candy).

# Changelog

**0.1.2** - Built-in LiveReload functionality added.

**0.1.1** - The Gruntfile now copies fonts from the src/styles/fonts folder.

**0.1.0** - `grunt server` is now the default task. The Gruntfile template now copys images, vanilla css, and scripts and no longer copies .ico and .htaccess files.

**0.0.2** - Use git clone instead of downloading theme zips from GitHub repos.

**0.0.1** - Only copy specified file extensions from themes.

**0.0.0** - Initial push.
