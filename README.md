# Cabin Beta
Cabin is a CLI tool that scaffolds out a [Grunt](http://gruntjs.com/) powered static site generator based on your choice of preprocessor, template language, and theme. Grunt's huge plugin ecosystem makes it easy to customize your generator extremely to suit the needs of your site.

# Usage

Cabin is not yet on npm, to install it you have to clone the repo and then use
[npm link](https://npmjs.org/doc/link.html)

You can then scaffold a static generator with the following command:
```shell
cabin new <site name> [user/repo]
```

The first parameter is the name of the site generated, and the second is the GitHub username and repository name of a `theme` to use for the site. If the `theme` parameter is left blank the [default theme](https://github.com/colinwren/testTheme) will be used.

# Creating themes

Themes are simply a collection of templates and styles which present the data for the site. Themes should support all of the data provided by the [grunt-pages](https://github.com/ChrisWren/grunt-pages) config.
