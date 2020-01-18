---
title: FAQ
layout: guides-2.7
---

--- name:headExtra pipeline:jade
link{:type => "text/css",
                :rel => "stylesheet",
                :href  => "/css/book.css"}
--- name:content pipeline:jade,markdown

h1 FAQ

h2 General questions

dl
  dt It looks neat, but is it production ready?
  dd
    :markdown
      - It is use in the backend for [LinkedIn Signal](http://sna-projects.com/blog/2010/10/linkedin-signal-a-look-under-the-hood/).

      - [ChaCha](http://www.chacha.com/) is using it in multiple internal applications.

      - A project is in currently development to support a site with over one million unique users.

  dt Should I extend ScalatraServlet or ScalatraFilter?

  dd
    :markdown
      The main difference is the default behavior when a route is not found.
      A filter will delegate to the next filter or servlet in the chain (as
      configured by web.xml), whereas a ScalatraServlet will return a 404
      response.

      Another difference is that ScalatraFilter matches routes relative to
      the WAR's context path.  ScalatraServlet matches routes relative to
      the servlet path.  This allows you to mount multiple servlets under in
      different namespaces in the same WAR.

      ### Use ScalatraFilter if:
      - You are migrating a legacy application inside the same URL space
      - You want to serve static content from the WAR rather than a dedicated web server

      ### Use ScalatraServlet if:
      - You want to match routes with a prefix deeper than the context path.

h2 sbt

dl
  dt
    :markdown
      Why am I getting errors like `foo is not a member of package org.blah`?

  dd
    :markdown
      sbt does not update your dependencies before compilation.  Run `sbt update` and then retry your build.

  dt How can I prevent OutOfMemoryErrors in sbt?
  dd
    :markdown
      Try changing your sbt shell script, as recommended by the [Lift Wiki](http://www.assembla.com/wiki/show/liftweb/Using_SBT):

          java -XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=256m -Xmx512M -Xss2M -jar `dirname $0`/sbt-launch.jar "$@"
