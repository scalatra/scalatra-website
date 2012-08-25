# Scalatra project

This is the home of The [Scalatra](http://github.com/scalatra/scalatra/) Book.

## Current snapshot

The latest version of the book is published to http://www.scalatra.org/2.0/book.

## Running the book yourself

In a shell, run the following:

    $ ./sbt
    > update
    > generate-site
    > jetty-run
    > ~generate-site

Review changes at [http://127.0.0.1:8081](http://127.0.0.1:8081)

Note: only sbt version 0.7 works at present, so make sure you install and use
that if you're having trouble generating the docs. 