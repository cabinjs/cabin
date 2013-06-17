# Cabin Beta
Cabin is a CLI tool that scaffolds out a [Grunt](http://gruntjs.com/) powered static site generator.

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

### [colinwren/testTheme](https://github.com/colinwren/testTheme)
> Slick blogging theme, great for use on personal sites

### [ChrisWren/icoDoc](http://chriswren.github.io/icoDoc/)
> Minimalist project documentation theme using icons in the navigation

