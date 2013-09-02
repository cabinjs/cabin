# Cabin Beta
> Simple and extensible static site generator powered by [Grunt](http://gruntjs.com/).
<img align="right" height="150" src="https://raw.github.com/colinwren/Candy/master/src/images/cabin.png">

[![NPM version](https://badge.fury.io/js/cabin.png)](http://badge.fury.io/js/cabin)  
[![Dependency Status](https://gemnasium.com/CabinJS/Cabin.png)](https://gemnasium.com/CabinJS/Cabin)  
[![Travis Status](https://travis-ci.org/CabinJS/Cabin.png?branch=master)](https://travis-ci.org/CabinJS/Cabin)  

# Learning about Cabin

To learn about Cabin, check out the [Cabin website](http://cabinjs.com).

# Contributing To Cabin

## Project Philosophy

Cabin's goal is to be a static site generator that encourages designers and developers to make themes and share them with the open source community. We want to make it easy to create and install themes so that theme authors can focus on developing themes, and users can quickly get up and running with their static sites.

Cabin should be usable by everyone who knows how to edit markdown, templates, and css. At the same time, we want to provide support for Grunt power users and evolve with the Grunt ecosystem. As such, we plan on having a minimal default Gruntfile and providing options for power users to scaffold a more advanced Gruntfile.

## Workflow

The recomended way to develop Cabin is to run `npm link` in the repo folder to create a symbolic global reference to `cabin`. You can then work on bugs/features using the latest code that you author in the repo.

### Debugging

We provide a `debug` grunt task to debug Cabin using [node-inspector](https://github.com/node-inspector/node-inspector). Once you have node-inspector launched in a separate terminal tab, 
simply run `grunt debug` command and set breakpoints in your browser.

You also debug integration and unit tests using the `grunt debug-test` command or the `grunt debug-test-dev` command to ignore remote tests for faster debugging.

## Tests

We use the [mocha](http://visionmedia.github.io/mocha/) test framework to test Cabin. To run the test suite and lint the JavaScripts, enter the following command:

```bash
grunt test
```

There are integration tests located in [this](https://github.com/CabinJS/Cabin/blob/master/test/integrationTests.js) file which verify that the html files were created as expected, and unit tests in [this](https://github.com/CabinJS/Cabin/blob/master/test/unitTests.js) file which verify the logic implemented in methods is working as expected.

The goal is to test any new features in the integration test file and test any changes to method logic in the unit test file.

# Changelog

**0.1.6** - Use themes' package.json file to determine the grunt-pages version rather than the gruntPagesVersion property in the cabin.json.

**0.1.5** - Have `cabin new` download theme's master branch instead of default branch.

**0.1.4** - Added `-l` flag to test local themes during development. Slimmed down generated Gruntfile. 

**0.1.3** - Use `0.0.0.0` as hostname for mobile debugging. Removed extra whitespace and connect folder from generated Gruntfile. Added `gruntPagesVersion` to cabin.json config.

**0.1.2** - Built-in LiveReload functionality added.

**0.1.1** - The Gruntfile now copies fonts from the src/styles/fonts folder.

**0.1.0** - `grunt server` is now the default task. The Gruntfile template now copys images, vanilla css, and scripts and no longer copies .ico and .htaccess files.

**0.0.2** - Use git clone instead of downloading theme zips from GitHub repos.

**0.0.1** - Only copy specified file extensions from themes.

**0.0.0** - Initial push.

## License

(The MIT License)

Copyright (c) 2013 Colin and Christopher Wren

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
