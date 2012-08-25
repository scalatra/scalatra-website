---
layout: default
title: Scalatra | The Anatomy of a Scalatra Application
---

The Anatomy of a Scalatra App
=============================

The recommended way of structuring a Scalatra project is as follows:

    project

    src
    |_ main
       |_ scala
       |  |   |_Scalatra.scala <= see note below!
       |  |
       |  |_org
       |      |_yourdomain
       |        |
       |        |_projectname
       |          |_ ArticlesServlet.scala
       |          |_ UsersServlet.scala
       |
       |_ webapp
          |
          |_ WEB-INF
             |
             |_ views
             |  |_ default.jade
             |
             |_ layouts
             |  |_ default.jade
             |
             |_ web.xml


### Mounting multiple servlets (or filters)

If you've got more than one servlet or filter in your application, you'll
need to mount them. If you're an old Java hand, you'll be quite comfortable
doing this through the `web.xml` file in traditional servlet style, but
Scalatra 2.1.x also introduces a more dynamic (and less XML-ish) method
of wiring your app together: the Scalatra bootstrap file.

You can set your web.xml file up like this:

{pygmentize:: xml}
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
      version="3.0">
    <listener>
      <listener-class>org.scalatra.servlet.ScalatraListener</listener-class>
    </listener>

    <servlet-mapping>
      <servlet-name>default</servlet-name>
      <url-pattern>/img/*</url-pattern>
      <url-pattern>/css/*</url-pattern>
      <url-pattern>/js/*</url-pattern>
      <url-pattern>/assets/*</url-pattern>
    </servlet-mapping>
</web-app>
{pygmentize}

Note that there are no servlet-names, servlet classes, etc. It's all handled
dynamically by the ScalatraListener class.

You can then place a file called Scalatra.scala in your `src/main/scala`
directory. The simplest version of this file might look like:

{pygmentize:: scala}
import org.scalatra.LifeCycle
import javax.servlet.ServletContext
import org.yourdomain.projectname._

class Scalatra extends LifeCycle {

  override def init(context: ServletContext) {

    // set init params like this:
    org.scalatra.cors.allowedOrigins = "http://example.com:8080 http://foo.example.com"

    // mount servlets like this:
    context mount (new ArticlesServlet, "/articles/*")
    context mount (new UsersServlet, "/users/*")
  }
}
{pygmentize}

This Scalatra class allows you to mount either servlets or filters (or both)
into your application, and define path patterns that they'll respond to.

It's also a good place to put things like database initialization code, which
need to be set up once in your application.


### Serving Static Files

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
          |    |_ default.css
          |- images
               |_ foo.jpg


In this application, the only publicly accessible files will be at
`stylesheets/default.css` and `images/foo.jpg`. Everything else will be
protected by the web application container.


### ScalatraServlet vs. ScalatraFilter

There are two base classes you can inherit from in order to make a
Scalatra application: `ScalatraServlet` and `ScalatraFilter`.

{pygmentize:: scala}
class YourServlet extends ScalatraServlet with ScalateSupport {
  // your class here
}
{pygmentize}

vs.

{pygmentize:: scala}
class YourFilter extends ScalatraFilter with ScalateSupport {
  // your class here
}
{pygmentize}

The main difference is the default behavior when a route is not found.
A `ScalatraFilter` will delegate to the next filter or servlet in the chain (as
configured by web.xml), whereas a `ScalatraServlet` will return a 404
response.

Another difference is that `ScalatraFilter` matches routes relative to
the WAR's context path. `ScalatraServlet` matches routes relative to the
servlet path. This allows you to mount multiple servlets in different namespaces
in the same WAR.

#### Use ScalatraFilter if:

* You are migrating a legacy application inside the same URL space
* You want to serve static content from the WAR rather than a
  dedicated web server

#### Use ScalatraServlet if:

* You want to match routes with a prefix deeper than the context path.


Understanding Scalatra's SBT Dependencies
=========================================

Scalatra uses Scala's [Simple Build Tool][sbt-site], or `sbt`, as a build system.

[sbt-site]: http://www.scala-sbt.org/

The `build.sbt` file defines the libraries which your application will depend on,
so that `sbt` can download them for you and build your Scalatra project.

Here's an example Scalatra sbt file:

{pygmentize:: scala}
organization := "org.example"

name := "yourapp"

version := "0.1.0-SNAPSHOT"

scalaVersion := "2.9.1"

seq(webSettings :_*)

classpathTypes ~= (_ + "orbit")

libraryDependencies ++= Seq(
  "org.scalatra" % "scalatra" % "2.1.0",
  "org.scalatra" % "scalatra-scalate" % "2.1.0",
  "org.scalatra" % "scalatra-specs2" % "2.1.0" % "test",
  "ch.qos.logback" % "logback-classic" % "1.0.6" % "runtime",
  "org.eclipse.jetty"        % "jetty-webapp"           % "8.1.5.v20120716"     % "container",
  "org.eclipse.jetty"        % "test-jetty-servlet"     % "8.1.5.v20120716"     % "test",
  "org.eclipse.jetty.orbit"  % "javax.servlet"          % "3.0.0.v201112011016" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))

)

resolvers += "Sonatype OSS Snapshots" at "http://oss.sonatype.org/content/repositories/snapshots/"
{pygmentize}

If your project depends on any additional libraries, you may add any other
dependencies you wish into the `libraryDependencies` section.

The default dependencies are:

`scalatra`: This is the core Scalatra module, and is required to run the framework.

`scalatra-scalate`: This integrates with [Scalate](http://scalate.fusesource.org),
a template engine supporting multiple template formats.  This is optional, but
highly recommended for any app requiring templating.

`scalatra-specs2`: This integrates the [Specs2][specs2] testing libraries.

`logback-classic`: Basic logging functionality, courtesy of [Logback][qos-ch].

`jetty-webapp`: This is the embedded servlet container used by the web plugin.
Your application should be portable to any servlet container supporting at least
the 2.5 specification.

`servlet-api`: Required for building your app.  It is placed in the `provided`
configuration so that it is not bundled with your application.  Your servlet
container will provide this at deployment time.

[specs2]: https://github.com/etorreborre/specs2
[qos-ch]: http://logback.qos.ch/


