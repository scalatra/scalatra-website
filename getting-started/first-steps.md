---
layout: default
title: Scalatra | Your first scalatra app
---

<div class="page-header">
  <h1>
    First steps
    <small>with Scalatra</small>
  </h1>
</div>

## Generate a Scalatra project

Now that the [installation](installation.html) is out of the way, you can
generate a project.

Run:

{% highlight bash %}

  g8 scalatra/scalatra-sbt

{% endhighlight %}

This will check out a pre-built application skeleton for you (from Github),
and ask you some questions about your application:

{% highlight bash %}

  $ g8 scalatra/scalatra-sbt
  > organization [com.example]:
  > package [com.example.app]:
  > name [scalatra-sbt-prototype]:
  > servlet_name [MyScalatraServlet]:
  > scala_version [2.9.1]:
  > version [0.1.0-SNAPSHOT]:

{% endhighlight %}

<dl class="dl-horizontal">
  <dt>organization</dt>
  <dd>Used for publishing.  Should be the reverse of a domain
name you control.  If you don't own a domain, `com.github.username` is a
popular choice.</dd>
  <dt>package</dt>
  <dd>All Scala code belongs in a package.  The [Scala Style
Guide](http://docs.scala-lang.org/style/naming-conventions.html#packages)
recommends that your packages start with your organization.  This convention is
used across multiple JVM languages and gives your project a globally unique
namespace.</dd>
  <dt>name</dt>
  <dd>The name of your project.  g8 will generate a project into a
folder of this name, and the artifacts you publish will be based on this name.</dd>
  <dt>servlet_name</dt>
  <dd>The name of your servlet. This might be something like
*BlogServlet* or just *Blog*.</dd>
  <dt>scala_version</dt>
  <dd>The version of Scala your project is built with.  When in
doubt, use the default.</dd>
  <dt>version</dt>
  <dd>The version number of your project.  This is entirely up to you,
but we like [Semantic Versioning](http://semver.org/).</dd>
</dl>

## Building

Scala is a compiled language, so you need to build your Scalatra project.

Enter your application's top-level directory and type `sbt`, and the
application will build.

## Hello world

Scalatra is installed, how about making your first application?  Source files
go into `src/main/scala/com/example/app` (substitute your package for
`com/example/app`).  Open
`src/main/scala/com/example/app/MyScalatraServlet.scala`, or whatever you named
your servlet when you generated your project with g8:

{% highlight scala %}

  package com.example.app

  import org.scalatra._
  import scalate.ScalateSupport

  class MyScalatraServlet extends ScalatraServlet with ScalateSupport {

    get("/") {
      <html>
        <body>
          <h1>Hello, world!</h1>
          Say <a href="hello-scalate">hello to Scalate</a>.
        </body>
      </html>
    }
  }

{% endhighlight %}

If you haven't already done so, from your project root, you can run the project
with:

{% highlight bash %}

  $ sbt
  > container:start

{% endhighlight %}

The application starts on [http://localhost:8080](http://localhost:8080).

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
As you can see, Scalatra doesn't force you to setup much infrastructure: a
request to a URL evaluates some Scala code and returns some text in response.
Whatever the block returns is sent back to the browser.
</div>

Scalatra allows you to return strongly-typed results from any of its actions.
The action above returns an XML literal - you could easily change it to return
a string, by altering the action:

{% highlight scala %}

  get("/") {
    "Hi there!"
  }

{% endhighlight %}

Returning a raw string is not something you'll do particularly often - usually
you will want to return formatted HTML which is the product of a templating
system, or an output format like JSON. See the [views](../guides/views.html) and
[helpers](../guides/helpers.html) of our [guides](../guides) for more info.

## Automatic code reloading

Restarting an application manually after every code change is both slow and
painful. It can easily be avoided by using a tool for automatic code reloading.

SBT will allow you to [signal a restart of the application when it detects
code changes](https://github.com/harrah/xsbt/wiki/Triggered-Execution). The
syntax for restarting includes adding `~` in front of the command you want to
re-execute.  To recompile and reload your application automatically with
xsbt-web-plugin 0.2.10, run the following:

{% highlight bash %}

  $ sbt
  > container:start
  > ~ ;copy-resources;aux-compile

{% endhighlight %}

## Scalatra examples

The easiest way to learn a new web framework is to see example code in action.

The Scalatra code base contains [examples][examples] which you can easily run
yourself. This is a great way to dissect some running code for common tasks,
including:

[examples]: https://github.com/scalatra/scalatra/tree/develop/example/src/main/scala/org/scalatra

* parameters
* form submission
* file uploading
* flash scope
* login / logout actions
* filters
* cookies
* chat (Atmosphere-based Meteor chat)
* chat (Servlet 3.0-based async chat)

To run the code, do the following:

    $ git clone https://github.com/scalatra/scalatra.git
    $ cd scalatra
    $ sbt
    # now you're in the sbt shell!
    > project scalatra-example
    > container:start

You should then get a website with examples running at
[http://localhost:8080/](http://localhost:8080/)
(make sure you're not already running your own project on that port!).

Example code can be found in the ```example/src/main/scala/org/scalatra/```
directory.

Now that you've got a (rather simplistic) running application, you may want to
[understand more](understanding-scalatra.html) about the project setup, or
dive straight into our [guides](../guides), which show you how to perform common
development tasks.

