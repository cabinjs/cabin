# Project Philosophy

Cabin's goal is to be a static site generator that encourages designers and developers to make themes and share them with the open source community. We want to make it easy to create and install themes so that theme authors can focus on developing themes, and users can quickly get up and running with their static sites.

Cabin should be usable by everyone who knows how to edit markdown, templates, and css. At the same time, we want to provide support for grunt power users and evolve with the Grunt ecosystem. As such, we plan on having a minimal default Gruntfile and provide options for power users to scaffold a more advanced Gruntfile.

# Tests

We use the [mocha](http://visionmedia.github.io/mocha/) test framework to test Cabin. To run the test suite, enter the following command:

```bash
grunt
```

There are integration tests located in [this](https://github.com/colinwren/Cabin/blob/master/test/integrationTests.js) file which verify that the html files were created as expected, and unit tests in [this](https://github.com/colinwren/Cabin/blob/master/test/unitTests.js) file which verify the logic implemented in methods is working as expected.

The goal is to test any new features in the integration test file and test any changes to method logic in the unit test file.