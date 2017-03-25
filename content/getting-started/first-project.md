---
title: First steps
---

## Generate a Scalatra project

Now that [installation](installation.html) is out of the way, you can
generate a project:

```bash
g8 scalatra/scalatra-sbt
```

This will check out a pre-built application skeleton for you (from [GitHub](https://github.com/scalatra/scalatra-sbt.g8)),
and ask you some questions about your application:

```
$ g8 scalatra/scalatra-sbt
organization [com.example]:
name [My Scalatra Web App]:
version [0.1.0-SNAPSHOT]:
servlet_name [MyScalatraServlet]:
package [com.example.app]:
scala_version [2.11.7]:
sbt_version [0.13.9]:
scalatra_version [2.5.0]: 

Template applied in ./my-scalatra-web-app
```

<dl class="dl-horizontal">
  <dt>organization</dt>
  <dd>
    Used for publishing.
    Should be the reverse of a domain name you control.
    If you don't own a domain, <code>com.github.username</code> is a popular choice.
  </dd>
  <dt>package</dt>
  <dd>
    All Scala code belongs in a package.
    The
    <a href="http://docs.scala-lang.org/style/naming-conventions.html#packages">
      Scala Style Guide
    </a> recommends that your packages start with your organization.
    This convention is used across multiple JVM languages and gives your
    project a globally unique namespace.
  </dd>
  <dt>name</dt>
  <dd>
    The name of your project.
    g8 will generate a project into a folder of that name, and the artifacts
    you publish will be based on that name.
  </dd>
  <dt>version</dt>
  <dd>
    Your project's version.
    This is entirely up to you, but we like
    <a href="http://semver.org">semantic versioning</a>.
  </dd>
  <dt>servlet_name</dt>
  <dd>
    The name of your servlet class.
    This might be something like <code>BlogServlet</code> or just <code>Blog</code>.
  </dd>
  <dt>scala_version</dt>
  <dd>
    The Scala version to use.
    The bottom of the <a href="http://www.scalatra.org/">homepage</a> lists which Scala versions are compatible with the latest Scalatra releases.
    When in doubt, use the default.
  </dd>
  <dt>sbt_version</dt>
  <dd>
    The SBT version.
  </dd>
  <dt>scalatra_version</dt>
  <dd>
    The Scalatra version to use.
    See the <a href="http://www.scalatra.org/">homepage</a> for a list. You can choose a stable version or if you want to try out new features go with a RC or SNAPSHOT.
  </dd>
</dl>


## Building

Scala is a compiled language, so you need to build your Scalatra project.

Enter your application's top-level directory, set `sbt` to executable,
and start the build system with `./sbt`.
For example:

```bash
$ cd /your/project/directory
$ chmod u+x sbt
$ ./sbt
```

sbt will also take care of downloading an entire Scalatra development
environment if you don't have one yet. That means sbt may spend some
time downloading Scalatra and its libraries on first run.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  Although most people use sbt to build their Scalatra projects, it's also
  possible to build using other systems, such as Maven. A user-contributed
  Maven prototype <a href="https://github.com/fancellu/scalatra-maven-prototype">is available</a>.
  For most new users, though, sbt will be the easiest way to get started.
</div>


## Hello world

Now that Scalatra is installed, how about making your first application?
Source files go into `src/main/scala/com/example/app`
(substitute your package for `com/example/app`).
Open `src/main/scala/com/example/app/MyScalatraServlet.scala`, or whatever
you named your servlet when you generated your project with g8:

```scala
package com.example.app

import org.scalatra._

class MyServlet extends ScalatraServlet with MyScalatraWebAppStack {

  get("/") {
    <html>
      <body>
        <h1>Hello, world!</h1>
        Say <a href="hello-scalate">hello to Scalate</a>.
      </body>
    </html>
  }

}
```

If you haven't already done so, from your project root, you can run the
project:

```bash
$ ./sbt
> jetty:start
```

The application starts on [http://localhost:8080](http://localhost:8080).

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  As you can see, Scalatra doesn't force you to setup much infrastructure: a
  request to a URL evaluates some Scala code and returns some text in
  response.
  Whatever the block returns is sent back to the browser.
</div>

Scalatra allows you to return strongly-typed results from any of its actions.
The action above returns an XML literal - you could easily change it to
return a string by altering the action:

```scala
get("/") {
  "Hi there!"
}
```

Returning a raw string is not something you'll do particularly often -
usually you will want to return formatted HTML that is the product of a
templating system, or an output format like JSON.
See the *views* section of our [guides](../guides) for more info.

## Automatic code reloading

Restarting an application manually after every code change is both slow and
painful. It can easily be avoided by using a tool for automatic code reloading.

sbt will allow you to [signal a restart of the application when it detects
code changes](http://www.scala-sbt.org/0.13/docs/Triggered-Execution.html).
The syntax for restarting involves adding `~` in front of the command you
want to re-execute.
To recompile and reload your application automatically, run the following:

```bash
$ ./sbt
> ~;jetty:stop;jetty:start
```

Now that you've got a (rather simplistic) running application, you may want
to [understand more](project-structure.html) about the project setup, or
dive straight into our [guides](../guides), which show you how to perform
common development tasks.

Many of the Scalatra guides have companion code projects, so you can learn
by seeing running example code in action.
