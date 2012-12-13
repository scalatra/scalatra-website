---
layout: default
title: Scalatra Guides | Configuration & deployment
---

<div class="page-header">
  <h1>Configuration & deployment</h1>
</div>

## Configuring your application

As you develop, test, and get ready for final deployment,
you'll need to configure things about your app: its environment, its settings,
initial configurations when it starts up, and the software it depends on.

### Configuring your app using the Scalatra bootstrap file

The Scalatra bootstrap file, new in Scalatra 2.1.x, is the recommended way
of configuring your application. It allows you to easily mount different
servlets, set application parameters, and run initialization code for your
app, without touching much in the way of XML.

If you've just started a new project in Scalatra 2.1.x, using the giter8 template,
all of this will already be set up for you. However, if you're upgrading from
2.0.x, or you just want to understand what's going on, read on.

First, the bad news: there *is* some XML involved, because this is one of the
points where Scalatra needs to interface with Java servlets, the underlying
technology it's sitting on top of.

All Scalatra projects have a `web.xml` file, in `src/main/webapp/WEB-INF/`.
Find yours and open it.

In a regular Java servlet application, most application configuration is done
inside `web.xml`. However, Scalatra applications can drop in some standard
config code, and use regular Scala code for configuration afterwards.

The XML which allows you to do this is as follows:

```xml
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
```

<span class="badge badge-success"><i class="icon-thumbs-up icon-white"></i></span>
If you started your project in an older version of Scalatra, and want to start
using the new Scalatra bootstrap configuration style, drop that XML into your
web.xml and you're all set.

Note that there are no servlet-names, servlet classes, etc. That's all
handled dynamically by the `ScalatraListener` class, which will supply our actual
configuration to the underlying servlet container.

This closes the XML portion of our broadcast.

Note that there is also a file called `Scalatra.scala` in your `src/main/scala`
directory. This is the Scalatra bootstrap config file, and it's where you should
do most of your app configuration work.

The simplest version of this file, which gets generated when you
make a new project using the giter8 template, looks something like this:

```scala
import org.scalatra.LifeCycle
import javax.servlet.ServletContext
import org.yourdomain.projectname._

class Scalatra extends LifeCycle {

  override def init(context: ServletContext) {

    // mount servlets like this:
    context mount (new ArticlesServlet, "/articles/*")

    // set init params like this:
    // org.scalatra.cors.allowedOrigins = "http://example.com"
  }
}
```

#### Mounting multiple servlets (or filters)

If you've got more than one servlet or filter in your application, you'll
need to mount them.

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you're coming from a dynamic language, such as PHP, Ruby, Python, or Perl,
you may be shocked to find that servlet-based applications, including Scalatra,
are unable to dynamically require and use controller classes. You'll need to
explicitly tell your application about a new `ScalatraServlet` or `ScalatraFilter`
whenever you add one.
</div>

The Scalatra bootstrap config class allows you to mount servlets or
filters (or both) into your application, and define URL path patterns that
they'll respond to.

```scala
override def init(context: ServletContext) {

  // mount a first servlet like this:
  context mount (new ArticlesServlet, "/articles/*")

  // mount a second servlet like this:
  context mount (new CommentsServlet, "/comments/*")

}
```

#### Setting init params

You can also set init params in the Scalatra bootstrap file. For instance, you
can set the `org.scalatra.environment` init parameter to set the application
environment:

```scala
override def init(context: ServletContext) {

  // mount a first servlet like this:
  context mount (new ArticlesServlet, "/articles/*")

  // Let's set the environment
  org.scalatra.environment = "production"

}
```

#### Running code at application start

The Scalatra bootstrap file is also a good place to put things like database
initialization code, which need to be set up once in your application. You can
mix in whatever traits you want, and run any Scala code you want from inside
the `init` method:

```scala
import org.scalatra.LifeCycle
import javax.servlet.ServletContext

// Import the trait:
import com.yourdomain.yourapp.DatabaseInit

// Mixing in the trait:
class Scalatra extends LifeCycle with DatabaseInit {

  override def init(context: ServletContext) {

    // call a method that comes from inside our DatabaseInit trait:
    configureDb()

    // Mount our servlets as normal:
    context mount (new Articles, "/articles/*")
    context mount (new Users, "/users/*")
  }
}
```

### Configuring your app using web.xml

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you're an old Java hand, you'll be quite comfortable mounting servlets
through the <code>web.xml</code> file in traditional servlet style, so you
may not want to use the Scalatra bootstrap file. If you want, you can use
web.xml for some things and the Scalatra bootstrap file for others.
</div>

#### Mounting multiple servlets (or filters) using web.xml

You can see an example of mounting multiple servlets in the Scalatra 2.0.x
examples
[web.xml](https://github.com/scalatra/scalatra/blob/support/2.0.x/example/src/main/webapp/WEB-INF/web.xml
)
file.

An extract from that file looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE web-app
PUBLIC "-//Sun Microsystems, Inc.//DTD Web Application 2.2//EN"
"http://java.sun.com/j2ee/dtds/web-app_2_2.dtd">
<web-app>
  <servlet>
    <servlet-name>BasicAuthExample</servlet-name>
    <servlet-class>org.scalatra.BasicAuthExample</servlet-class>
  </servlet>
  <servlet>
    <servlet-name>TemplateExample</servlet-name>
    <servlet-class>org.scalatra.TemplateExample</servlet-class>
  </servlet>
</web-app>
```

#### Setting init params using web.xml

You can set init params for your servlets in the normal manner:

```xml
<servlet>
  <servlet-name>BasicAuthExample</servlet-name>
  <servlet-class>org.scalatra.BasicAuthExample</servlet-class>
  <init-param>
    <param-name>org.scalatra.environment</param-name>
    <param-value>development</param-value>
  </init-param>
</servlet>
```

### Application environments

The application environment is defined by:

1. The `org.scalatra.environment` system property.
2. The `org.scalatra.environment` init parameter.

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
The default is `development`.

You can set the application's environment in the following ways:

1. The preferred method: as an init-param in the Scalatra Bootstrap file.
2. As an init-param in web.xml.
3. As a system property: this is most commonly set with a `-D` option on the
command line: `java -Dorg.scalatra.environment=development`

If the environment starts with "dev", then `isDevelopmentMode` returns true.

In development mode, a few things happen.

 * In a ScalatraServlet, the notFound handler is enhanced so that it dumps the
effective request path and the list of routes it tried to match. This does not
happen in a ScalatraFilter, which just delegates to the filterChain when no
route matches.
 * Meaningful error pages are enabled (e.g. on 404s, 500s).
 * The [Scalate console][console] is enabled.

[console]: http://scalate.fusesource.org/documentation/console.html

### Logging

By default, Scalatra uses [Logback][logback] for logging.

[logback]:http://logback.qos.ch

You can easily add logging facilities to your project, if you've got the
logging dependency in your `build.sbt` file:

```scala
"ch.qos.logback" % "logback-classic" % "1.0.0" % "runtime"
```

In your servlet or filter class:

```scala
import org.slf4j.{Logger, LoggerFactory}

class YourServlet extends ScalatraServlet {

  val logger =  LoggerFactory.getLogger(getClass)

  def get("/") {
    logger.info("foo")
    // whatever else you want to put in the body of the action
  }
}
```

This will get you basic logging support. There are some additional logging
libraries you might want to investigate: [slf4s][slf4s] and
[grizzled-slf4j][grizzled-slf4j],
which act as Scala wrappers around slf4j.

[slf4s]:https://github.com/weiglewilczek/slf4s
[grizzled-slf4j]:http://software.clapper.org/grizzled-slf4j/

The Scala wrappers use by-name parameters for the log message, and
check to see that the logging level is enabled.  This is a performance
win for complex log messages involving expensive `toString`s or many
concatenations.


### Changing the port in development

Add `port in container.Configuration := 8081` to `build.sbt` if you would
like your Scalatra app to run something other than the default port (8080).


## Production deployment

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you're coming from a non-Java background, you may find the subject of
servlet containers and JVM deployments to be unnecessarily frightening. Don't
despair. Despite all the mystery which surrounds them, servlet deployments are
extremely simple. You will be surprised at how easy it is!
</div>

### As a war file

The simplest way to deploy your Scalatra application is as a Web ARchive (WAR)
file. With any luck, your app can be up and running in a production configuration
about 5 minutes from now.

From the command line, execute the following:

    $ sbt

Now you're in the sbt console. Package your application by typing `package`:

    > package
    [info] Compiling 6 Scala sources to /path/to/your/project/target/scala-2.9.1/classes...
    [info] Packaging /path/to/your/project/target/scala-2.9.1/yourproject_2.9.1-0.1.0-SNAPSHOT.war ...
    [info] Done packaging.

This will generate a WAR file for you, and tell you where it went. A WAR file
is basically a zip file which contains your entire application, including all
of its compiled Scala code, and associated assets such as images, javascript,
stylesheets.

#### Jelastic

Now that you've got the war file, you need to put it in on an application server.
One easy way to do this is to put it up onto [Jelastic](http://jelastic.com/),
a Java Platform as a Service provider.

This is the simplest option, if you want to get something running and put
it up on the public-facing internet. Sign up for the (free) service, upload
your WAR file, and you're finished.

#### Your own servlet container

Another option is to run your own servlet container - there are certainly
[lots to choose from](http://en.wikipedia.org/wiki/Web_container).

Let's try [Tomcat](http://tomcat.apache.org), with a local installation.

<div class="alert alert-info">
<p><span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
What follows is <strong>not</strong> a best-practice guide for configuring Tomcat.
It's aimed at people who are new to servlet containers, and want to see their
application working. Servlet container configuration can be as potentially complex
as other web servers, such as Apache or Nginx, and it's up to you to understand
the performance and security implications of what you're doing. We recommend
that you read the docs on your chosen servlet container before exposing yourself
to the public internet.</p>

<p>Having said all that, the basic case is extremely easy, as you'll see in a moment.</p>
</div>

First download and extract tomcat:

    $ wget http://mirror.lividpenguin.com/pub/apache/tomcat/tomcat-7/v7.0.29/bin/apache-tomcat-7.0.29.tar.gz
    $ mv apache-tomcat-7.0.29.tar.gz ~/Desktop/tomcat.tar.gz # or wherever you want it.
    $ tar -xvzf ~/Desktop/tomcat.tar.gz

Ok, Tomcat is now installed.

    $ ~/Desktop/tomcat/bin/startup.sh

Now it should be started. Test this by browsing to
[http://localhost:8080/](http://localhost:8080/)

Now deploy your application. Dropping a war file into Tomcat's `webapp` folder
causes it to be extracted, or "exploded". Tomcat will initialize your application
on the first request.

    $ mv /path/to/your/project/target/scala-2.9.1/yourproject_2.9.1-0.1.0-SNAPSHOT.war ~/Desktop/tomcat/webapps/yourapp.war

Browse to [http://localhost:8080/yourapp/](http://localhost:8080/yourapp/)

It's alive! Or it should be.

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
Keep in mind that we've assumed your application has a route defined at the
path "/".
</div>

Paths inside the servlet container will be root-relative, so if you've
got your servlets mounted like this in your Scalatra bootstrap file:

    // mount servlets like this:
    context mount (new ArticlesServlet, "/articles/*")

you would need to go to [http://localhost:8080/yourapp/articles/](http://localhost:8080/yourapp/articles/)

If you've hardcoded any paths in your application, you may see your app working,
but the stylesheets and internal links may not be working correctly.

If that's the case, it's time for a bit of a trick. You can move Tomcat's
ROOT application to another spot, and put your app at the ROOT.

    $ mv ~/Desktop/tomcat/webapps/ROOT ~/Desktop/tomcat/webapps/ORIGINAL_ROOT
    $ mv /path/to/your/project/target/scala-2.9.1/yourproject_2.9.1-0.1.0-SNAPSHOT.war ~/Desktop/tomcat/webapps/ROOT.war

<div class="alert alert-warning">
<span class="badge badge-warning"><i class="icon-flag icon-white"></i></span>  Tomcat paths are case-sensitive. Make sure you copy your app to `ROOT.war`.<br /><br />
Request body params dont get parsed in 'put(/:resource)' api when deploying scalatra app as a WAR in tomcat 6/7. To make your put work, set the connector attribute 'parseBodyMethods' to 'POST,PUT' in server.xml
of tomcat.
The same goes for PATCH.
</div>

Your app should now be running at [http://localhost:8080/](http://localhost:8080/)

### Launching Scalatra as a servlet

ScalatraServlet is an HttpServlet, we just need some glue code to launch an
embedded Jetty server with this Servlet.

```scala
package com.example  // remember this package in the sbt project definition
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler}
import org.eclipse.jetty.webapp.WebAppContext
import org.scalatra.TemplateExample // this is the example Scalatra servlet

object JettyLauncher { // this is my entry object as specified in sbt project definition
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[TemplateExample], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }
}
```

With the [sbt-assembly](https://github.com/sbt/sbt-assembly) plugin you can make a launchable jar.
Now save this alongside your Scalatra project as JettyLauncher.scala and run
<code>sbt clean assembly</code>. You'll have the ultimate executable jar file
in the target soon. Try

```bash
java -jar **-assembly-**.jar
```

and see it will launch the embedded Jetty at port 8080 with the example
Scalatra project running. On an OS X 10.6 machine with JVM 1.6, this setup
costs ~38MB memory.

### Heroku

This is pretty easy to get up and running. The only thing you really need to do
is start Jetty directly, and add a script to execute this. You don't want to
have to rely on SBT to start your application.

The easiest way to do this is create a Main method to start Jetty. See
JettyLauncher.scala (listing at bottom of this section) - save this in your
src/main/scala dir, setting the filter to your applications filter. Then
use Typesafe's start script plugin to generate a script to start the app.

To enable the plugin, add the following to project/plugins/build.sbt


```scala
resolvers += Classpaths.typesafeResolver

addSbtPlugin("com.typesafe.startscript" % "xsbt-start-script-plugin" % "0.5.0")
```


And the following to your build.sbt

```scala
import com.typesafe.startscript.StartScriptPlugin

seq(StartScriptPlugin.startScriptForClassesSettings: _*)
```

Once this is done, you are ready to deploy to Heroku. Create a Procfile in
the root of your project containing

    web: target/start

Commit your changes to git and make sure you have the heroku gem installed
(see Heroku's general [Scala instructions](http://devcenter.heroku.com/articles/scala)).
You can then create and push the app.

    heroku create appname --stack cedar
    git push heroku master

```scala
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{DefaultServlet, ServletContextHandler}
import org.eclipse.jetty.webapp.WebAppContext

object JettyLauncher {
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[MyCedarServlet], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }

}
```

### Including the Scala compiler

If you need the Scala compiler included within a WAR file add the declaration
below to your SBT build file.

```scala
override def webappClasspath = super.webappClasspath +++ buildCompilerJar
```
