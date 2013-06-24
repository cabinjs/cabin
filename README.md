# Cabin Beta
> Cabin is a CLI tool that scaffolds out a [Grunt](http://gruntjs.com/) powered static site generator.

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
grunt server
```
# Themes
Cabin themes provide styling and structure for your static site project. They work great out of the box and as starting points for more customized sites.

## Avaliable Themes

### [colinwren/Candy](https://github.com/colinwren/Candy)
> Slick blogging theme, great for use on personal sites

### [ChrisWren/icoDoc](http://chriswren.github.io/icoDoc/)
> Minimalist project documentation theme using icons in the navigation

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
      "url": ":title"
    }
  }
}
```

Aside from this `cabin.json` configuration file, themes are composed of layout files, style files, and default posts.

### Theme file locations

#### Layouts
Layout **must** be in the `src/layouts` folder

#### Styles
Style files **must** be in the `src/styles` directory.

#### Posts
All markdown posts **must** be in the `posts` directory.

The best way to learn about how to develop a theme is by referencing the [default theme](https://github.com/colinwren/Candy).
