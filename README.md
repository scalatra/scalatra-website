# Scalatra project

This is the home of the [Scalatra](http://github.com/scalatra/scalatra/)
website which generates the site at [scalatra.org](http://scalatra.org).

To build it, you'll need to have Ruby and bundler installed.

Then you'll need [Jekyll](https://github.com/mojombo/jekyll) and a 
few other things installed on your system. `cd` into the root directory
of the project and type:

```
bundle install
```

This will download the project's rubygem dependencies.

Note: on recent LLVM-favoring versions of Mac, you will need to install
[gcc](https://github.com/kennethreitz/osx-gcc-installer).

Once everything's installed, you can do this to generate the documentation:

```
jekyll --server --auto
```

This will start an embedded webserver and automatically regenerate the website
as you make changes to it. You can then view the site at 
[http://localhost:4000/2.3/](http://localhost:4000/2.3/).
