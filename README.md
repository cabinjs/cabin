# Cabin
> Static site generator scaffolding for [grunt](http://gruntjs.com/)

Cabin scaffolds out a static site generator by creating a Gruntfile and a theme made up of style and template files. Cabin can generate ejs or jade templates, and your choice of Sass, LESS, or CSS.

# Usage

To use cabin, install it globally with the following command:
```shell
npm install -g cabin
```

You can then scaffold a static generator with the following command:
```shell
cabin new <folder> [GitHub user/GitHub repo]
```

The first parameter is the name of the `folder` where the scaffold is generated, and the second is the location of a `theme` to use for the site. If the `theme` parameter is left blank the [default theme](https://github.com/ChrisWren) will be used.

# Creating themes

Themes are simply a collection of templates and styles which present the data for the site. Themes should support all of the data provided by the [grunt-pages](https://github.com/ChrisWren/grunt-pages) config.
