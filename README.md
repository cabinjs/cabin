# Cabin Beta
> Cabin is a simple and extensible static site generator powered by [Grunt](http://gruntjs.com/).
<img align="right" height="150" src="https://raw.github.com/colinwren/Candy/master/src/images/cabin.png">

[![NPM version](https://badge.fury.io/js/cabin.png)](http://badge.fury.io/js/cabin)  
[![Dependency Status](https://gemnasium.com/colinwren/Cabin.png)](https://gemnasium.com/colinwren/Cabin)  
[![Travis Status](https://travis-ci.org/colinwren/Cabin.png)](https://travis-ci.org/colinwren/Cabin)  

# Getting Started

First install Cabin and Grunt globally with the following command:
```bash
npm install -g cabin grunt-cli
```
You can then scaffold a static generator with the following command:
```bash
cabin new myBlog colinwren/Candy
```
The first parameter is the name of the destination folder, and the second is the GitHub username and repository name of a `theme` to use for the site. If the `theme` parameter is left blank, the [default theme](http://colinwren.github.io/Candy/) will be used.

After scaffolding a site generator, you can run it by entering the project directory and running `grunt` with this command:
```bash
cd myBlog && grunt
```
This will build your site, start a static file server, open a browser tab with the site's homepage, and start a watch process to rebuild your site when your source files change. Try editing or creating a new markdown file in the `posts` folder (if you are using the default theme) and upon save your site will be automatically rebuilt. When your site has been rebuilt, your browser will automatically refresh with your updated site.

# Themes
Cabin themes provide styling and structure for your static site project. They work great out of the box and as starting points for more customized sites.

## Featured themes

### [colinwren/Candy](http://colinwren.github.io/Candy/)
[![Candy theme](https://raw.github.com/colinwren/Cabin/gh-pages-src/src/images/Candy.png)](http://colinwren.github.io/Candy/)
### [colinwren/Blok](http://colinwren.github.io/Blok/)
[![Blok theme](https://raw.github.com/colinwren/Cabin/gh-pages-src/src/images/Blok.png)](http://colinwren.github.io/Blok/)

## Creating Themes

### Configuration

The only file explicitly required is a `cabin.json` configuration in the root of the repo. This file describes what CSS preprocessors and template languages that your theme supports as well as the configuration for [grunt-pages](https://github.com/ChrisWren/grunt-pages). We currently support EJS and Jade templates and the Sass and LESS style languages.

Here is an example `cabin.json` file which states that the project supports Sass, Jade, and has the specified config for the `~0.4.0` version of the grunt-pages task:
```json
{
  "style": [
    "Sass"
  ],
  "template": [
    "Jade"
  ],
  "gruntPagesVersion": "~0.4.0",
  "gruntPages": {
    "posts": {
      "src": "posts",
      "dest": "dist",
      "layout": "src/layouts/post.jade",
      "url": "blog/posts/:title/"
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
├── dist
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

### Testing a theme

To test your theme, run cabin with the `-l` flag. For example if I had a theme in a folder called `themeFolder` and I wanted to make sure it was working properly, I would run the following command:
```bash
cabin new site themeFolder -l
```
Then I could `cd site && grunt` to make sure my theme will work as expected for users when they install it with Cabin.

To see an example theme repo, check out the [default theme](https://github.com/colinwren/Candy).

# Changelog

**0.1.4** - Added `-l` flag to test local themes during development. Slimmed down generated Gruntfile. 

**0.1.3** - Use `0.0.0.0` as hostname for mobile debugging. Removed extra whitespace and connect folder from generated Gruntfile. Added `gruntPagesVersion` to cabin.json config.

**0.1.2** - Built-in LiveReload functionality added.

**0.1.1** - The Gruntfile now copies fonts from the src/styles/fonts folder.

**0.1.0** - `grunt server` is now the default task. The Gruntfile template now copys images, vanilla css, and scripts and no longer copies .ico and .htaccess files.

**0.0.2** - Use git clone instead of downloading theme zips from GitHub repos.

**0.0.1** - Only copy specified file extensions from themes.

**0.0.0** - Initial push.
