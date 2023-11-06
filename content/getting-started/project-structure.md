---
title: Project structure
---

## Paths

The recommended way of structuring a Scalatra project is as follows. It's
what you get when you generate a new project using `sbt new`:

```
build.sbt               <= dependencies and project config are set in here

project
|_build.properties      <= specifies what version of sbt to use
|_plugins.sbt           <= sbt plugins can be added here

src
|_ main
|  |_ resources
|     |_ logback.xml
|  |_ scala
|  |  |   |_ScalatraBootstrap.scala     <= mount servlets in here
|  |  |_org
|  |      |_ yourdomain
|  |         |_ projectname
|  |            |_ MyScalatraServlet.scala
|  |_ twirl
|  |  |_layouts
|  |    |_default.scala.html
|  |  |_views
|  |    |_hello.scala.html
|  |_ webapp
|     |_ WEB-INF
|        |_ web.xml
|_ test
   |_ scala
      |_ org
         |_ yourdomain
            |_ projectname
               |_ MyScalatraServletTests.scala
```


The basic structure should be reasonably familiar to anybody who's seen a
Rails, Sinatra, or Padrino application. Your views go in the views folder,
layouts (which wrap views) go in the layouts folder.

The Scalatra template project puts your Scala application code into a series of
namespaced directories: in the example above, `org.yourdomain.projectname`.
This is entirely optional. The [Scala style guide](https://docs.scala-lang.org/style/)
suggests doing it this way, but the language doesn't do anything to enforce it.
If you want to, you can put all of your Scala code in the same directory for easier
navigation.

## Serving static files

Static files can be served out of the `webapp` folder, which acts as the ROOT
directory. As with any servlet based application, the contents of this directory
are all public, with the exception of files in the WEB-INF directory.

An example structure may help in understanding this.

    src
    |_ main
       |_ scala
       |  |_ Web.scala
       |_ webapp
          |_ WEB-INF
          |  |_ web.xml
          |- stylesheets
          |  |_ default.css
          |- images
             |_ foo.jpg


In this application, the only publicly accessible files will be at
`stylesheets/default.css` and `images/foo.jpg`. Everything else will be
protected by the web application container.


## ScalatraServlet vs. ScalatraFilter

There are two base classes you can inherit from in order to make a
Scalatra application: `ScalatraServlet` and `ScalatraFilter`.

```scala
class YourServlet extends ScalatraServlet {
  // your class here
}

```

vs.

```scala
class YourFilter extends ScalatraFilter {
  // your class here
}

```

The main difference is the default behavior when a route is not found.
A `ScalatraFilter` will delegate to the next filter or servlet in the chain (as
configured by `web.xml`), whereas a `ScalatraServlet` will return a 404
response.

Another difference is that `ScalatraFilter` matches routes relative to
the WAR's context path. `ScalatraServlet` matches routes relative to the
servlet path. This allows you to mount multiple servlets in different namespaces
in the same WAR.

### Use ScalatraFilter if:

* You are migrating a legacy application inside the same URL space
* You want to serve static content from the WAR rather than a
  dedicated web server

### Use ScalatraServlet if:

* You want to match routes with a prefix deeper than the context path.
* You're not sure which to use!


## Scalatra's sbt dependencies

Scalatra uses [sbt][sbt-site], or sbt, as a build system.

[sbt-site]: https://www.scala-sbt.org/

The `build.sbt` file defines the libraries which your application will depend on,
so that `sbt` can download them for you and build your Scalatra project.

Here's an example Scalatra `build.sbt` file:

```scala
val ScalatraVersion = "{{< 3-0-scalatra_version >}}"

organization := "com.example"

name := "My Scalatra Web App"

version := "0.1.0-SNAPSHOT"

scalaVersion := "2.13.12"

libraryDependencies ++= Seq(
  "org.scalatra" %% "scalatra-jakarta" % ScalatraVersion,
  "org.scalatra" %% "scalatra-scalatest-jakarta" % ScalatraVersion % "test",
  "ch.qos.logback" % "logback-classic" % "{{< 3-0-logback_version >}}" % "runtime",
  "org.eclipse.jetty" % "jetty-webapp" % "{{< 3-0-jetty_version >}}" % "container",
  "jakarta.servlet" % "jakarta.servlet-api" % "{{< 3-0-servlet_version >}}" % "provided"
)

enablePlugins(SbtTwirl)
enablePlugins(JettyPlugin)
```

<div class="alert alert-info">
<span class="badge badge-info"><i class="glyphicon glyphicon-flag"></i></span>
If you want to add any additional libraries to your project, add them to the
<code>libraryDependencies</code> section.
Doing that and running <code>sbt</code> again will download the dependency jar
libraries and make them available to your application.
If you don't know what the dependency details are, you can find out on
<a href="https://search.maven.org">https://search.maven.org</a>.
</div>

The default dependencies are:

<dl class="dl-horizontal">
  <dt>scalatra</dt>
  <dd>This is the core Scalatra module, and is required to run the framework.</dd>
  <dt>scalatra-scalatest</dt>
  <dd>
    This integrates the <a href="https://github.com/scalatest/scalatest">scalatest</a>
    testing libraries.
    It is placed in the <code>test</code> scope, so it's not deployed with your app
    in production.
  </dd>
  <dt>logback-classic</dt>
  <dd>
    Basic logging functionality, courtesy of
    <a href="http://logback.qos.ch/">Logback</a>.
    It's placed in the <code>runtime</code> scope so it's not bundled with your
    application.
    This allows the particular logging implementation (or no logging implementation
    at all), to be provided at runtime.
  </dd>
  <dt>jetty-webapp</dt>
  <dd>
    This is the embedded servlet container used by the web plugin.
    Your application should be portable to any servlet container supporting at least
    the 3.0 specification.
  </dd>
  <dt>javax.servlet</dt>
  <dd>
    Required for building your app.
    It is placed in the <code>provided</code> configuration so that it is not bundled
    with your application.
    Your servlet container will provide this at deployment time.
  </dd>
</dl>
