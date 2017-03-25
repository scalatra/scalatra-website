---
title: Project structure
---

## Paths

The recommended way of structuring a Scalatra project is as follows. It's
what you get when you generate a new project using giter8:

    project
    |_build.properties      <= specifies what version of sbt to use
    |_build.scala           <= dependencies and project config are set in here
    |_plugins.sbt           <= sbt plugins can be added here

    src
    |_ main
    |  |_ scala
    |  |  |   |_ScalatraBootstrap.scala     <= mount servlets in here
    |  |  |_org
    |  |      |_ yourdomain
    |  |         |_ projectname
    |  |            |_ MyScalatraServlet.scala
    |  |_ webapp
    |     |_ WEB-INF
    |        |_ views
    |        |  |_ hello-scalate.scaml
    |        |_ layouts
    |        |  |_ default.scaml
    |        |_ web.xml
    |_ test
       |_ scala
          |_ org
             |_ yourdomain
                |_ projectname
                   |_ MyScalatraServletSpec.scala



The basic structure should be reasonably familiar to anybody who's seen a
Rails, Sinatra, or Padrino application. Your views go in the views folder,
layouts (which wrap views) go in the layouts folder.

The Scalatra giter8 project puts your Scala application code into a series of
namespaced directories: in the example above, `org.yourdomain.projectname`.
This is entirely optional. The [Scala style guide](http://docs.scala-lang.org/style/)
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
          |  |_ secret.txt
          |  |_ views
          |  |  |_ default.jade
          |  |
          |  |_ layouts
          |  |  |_ default.jade
          |  |
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
class YourServlet extends ScalatraServlet with ScalateSupport {
  // your class here
}

```

vs.

```scala
class YourFilter extends ScalatraFilter with ScalateSupport {
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

Scalatra uses Scala's [Simple Build Tool][sbt-site], or sbt, as a build system.

[sbt-site]: http://www.scala-sbt.org/

The `project/build.scala` file defines the libraries which your application will depend on,
so that `sbt` can download them for you and build your Scalatra project.

Here's an example Scalatra `project/build.scala` file:

```scala
import sbt._
import Keys._
import org.scalatra.sbt._
import org.scalatra.sbt.PluginKeys._
import com.mojolly.scalate.ScalatePlugin._
import ScalateKeys._

object MyExampleBuild extends Build {
  val Organization = "com.example"
  val Name = "An Example Application"
  val Version = "0.1.0-SNAPSHOT"
  val ScalaVersion = "2.10.1"
  val ScalatraVersion = "{{< 2-5-scalatra_version >}}"

  lazy val project = Project (
    "scalatra-buildfile-example",
    file("."),
    settings = Defaults.defaultSettings ++ ScalatraPlugin.scalatraWithJRebel ++ scalateSettings ++ Seq(
      organization := Organization,
      name := Name,
      version := Version,
      scalaVersion := ScalaVersion,
      resolvers += "Sonatype OSS Snapshots" at "http://oss.sonatype.org/content/repositories/snapshots/",
      resolvers += "Akka Repo" at "http://repo.akka.io/repository",
      libraryDependencies ++= Seq(
        "org.scalatra" %% "scalatra" % ScalatraVersion,
        "org.scalatra" %% "scalatra-scalate" % ScalatraVersion,
        "org.scalatra" %% "scalatra-specs2" % ScalatraVersion % "test",
        "ch.qos.logback" % "logback-classic" % "{{< 2-5-logback_version >}}" % "runtime",
        "org.eclipse.jetty" % "jetty-webapp" % "{{ < 2-5-jetty_version >}}" % "container",
        "org.eclipse.jetty.orbit" % "javax.servlet" % "{{< 2-5-servlet_version >}}" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
      ),
      scalateTemplateConfig in Compile <<= (sourceDirectory in Compile){ base =>
        Seq(
          TemplateConfig(
            base / "webapp" / "WEB-INF" / "templates",
            Seq.empty,  /* default imports should be added here */
            Seq.empty,  /* add extra bindings here */
            Some("templates")
          )
        )
      }
    )
  )
}

```

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you want to add any additional libraries to your project, add them to the
<code>libraryDependencies</code> section.
Doing that and running <code>./sbt</code> again will download the dependency jar
libraries and make them available to your application.
If you don't know what the dependency details are, you can find out on
<a href="http://search.maven.org">http://search.maven.org</a>.
</div>

If you're using [IDE plugins](ide-support.html) like
[sbt-eclipse](https://github.com/typesafehub/sbteclipse) or
[sbt-idea](https://github.com/mpeltonen/sbt-idea) to make sbt dependencies
available to your IDE, make sure you re-run `sbt-eclipse` or `sbt-idea` from
within sbt whenever you add or update a dependency in `project/build.scala`.

The default dependencies are:

<dl class="dl-horizontal">
  <dt>scalatra</dt>
  <dd>This is the core Scalatra module, and is required to run the framework.</dd>
  <dt>scalatra-scalate</dt>
  <dd>
    This integrates with <a href="http://scalate.github.io/scalate">Scalate</a>,
    a template engine supporting multiple template formats. Scalate is optional, but
    highly recommended for any app requiring templating.
  </dd>
  <dt>scalatra-specs2</dt>
  <dd>
    This integrates the <a href="https://github.com/etorreborre/specs2">Specs2</a>
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
    the 2.5 specification.
  </dd>
  <dt>javax.servlet</dt>
  <dd>
    Required for building your app.
    It is placed in the <code>provided</code> configuration so that it is not bundled
    with your application.
    Your servlet container will provide this at deployment time.
  </dd>
</dl>

The Scalatra components in your project should all have the same version number
({{< 2-5-scalatra_version >}} in the above example).
Although it's theoretically possible to mix and match differently-versioned components
in your projects, it's not recommended, because we compile, test and release Scalatra
dependencies together based on their version number.

---

Now that you understand the basics of building Scalatra apps, we recommend you
consider [using JRebel](jrebel.html), which will make your webapp restart much more
quickly after a code change during development.
You may also want to [set up your IDE](ide-support.html).
