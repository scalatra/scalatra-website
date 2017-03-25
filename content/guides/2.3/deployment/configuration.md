---
aliases:
  - /2.3/guides/deployment/configuration.html
title: Configuration
---

As you develop, test, and get ready for final deployment,
you'll need to configure things about your app: its environment, its settings,
initial configurations when it starts up, and the software it depends on.

---

### Configuring your app using the ScalatraBootstrap file

As of 2.1.x, the `ScalatraBootstrap` file is the recommended way
of configuring your application. It allows you to easily mount different
servlets, set application parameters, and run initialization code for your
app, without touching much in the way of XML.

If you've just started a new project in Scalatra 2.2.x, using the giter8 template,
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
using the new ScalatraBootstrap configuration style, drop that XML into your
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

class ScalatraBootstrap extends LifeCycle {

  override def init(context: ServletContext) {

    // mount servlets like this:
    context mount (new ArticlesServlet, "/articles/*")
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

The `ScalatraBootstrap` config class allows you to mount servlets or
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

#### Init params

You can set init params in the Scalatra bootstrap file. For instance, you
can set the `org.scalatra.environment` init parameter to set the application
environment:

```scala
override def init(context: ServletContext) {

  // mount a first servlet like this:
  context mount (new ArticlesServlet, "/articles/*")

  // Let's set the environment
  context.initParameters("org.scalatra.environment") = "production"

}
```

Each init param can be set in one of two ways.

The first form looks like this:

`context.setInitParameter(org.scalatra.EnvironmentKey, "production")`

The second form has a bit of syntactic sugar on it, so it looks a little
less Java:

`context.initParameters("org.scalatra.environment") = "production"`

The two forms are equivalent.


##### Environment init param

`context.setInitParameter(org.scalatra.EnvironmentKey, "production")` or
`context.initParameters("org.scalatra.environment") = "production"`

This init param sets the application environment.

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
The default is `development`.

If the environment starts with "dev", then `isDevelopmentMode` returns true.

In development mode, a few things happen.

 * In a ScalatraServlet, the notFound handler is enhanced so that it dumps the
effective request path and the list of routes it tried to match. This does not
happen in a ScalatraFilter, which just delegates to the filterChain when no
route matches.
 * Meaningful error pages are enabled (e.g. on 404s, 500s).
 * The [Scalate console][console] is enabled.

[console]: http://scalate.github.io/scalate/documentation/console.html

##### Container init params

`context.setInitParameter(ScalatraBase.HostNameKey, "myapp.local")` or
`context.initParameters("org.scalatra.HostName") = "myapp.local"`

`context.setInitParameter(ScalatraBase.PortKey, 443)` or
`context.initParameters("org.scalatra.Port") = 443`

`context.setInitParameter(ScalatraBase.ForceHttpsKey, "true")` or
`context.initParameters("org.scalatra.ForceHttps") = "true"`

By default, the values for hostname, port, and SSL settings are inherited from
the servlet container's settings. You can set these init params if you want to
override the domain or port your website is hosted on, or force the use of https.

So if Jetty is running at http://localhost:8080 on your machine you may want
to expose it as: https://myapp.local:443 (with an appropriate entry in
`/etc/hosts`).

##### Cross Origin Resource Sharing init params

These keys and their purposes are documented in the
[CORS guide](../web-services/cors.html), but for completeness, here they are.

The CORS guide uses the alternate forms of these keys, so check in that guide
if you'd like to see the alternate form.

`context.setInitParameter(CorsSupport.AllowedOriginsKey, "www.other.com,www.foo.com")`
`context.setInitParameter(CorsSupport.AllowedMethodsKey, "GET,PUT")`
`context.setInitParameter(CorsSupport.AllowedHeadersKey, "Content-Type")`
`context.setInitParameter(CorsSupport.AllowCredentialsKey, "true")`
`context.setInitParameter(CorsSupport.PreflightMaxAgeKey, 1800)`

##### Async init params

`context.setAttribute(AsyncSupport.ExecutionContextKey, executionContext)` or
`context.initParameters("org.scalatra.ExecutionContext") = executionContext`

This key sets the `ExecutionContext` which Scalatra should use when creating an
Akka `Future`.

#### Running code at application start

The ScalatraBootstrap file is also a good place to put things like database
initialization code, which need to be set up once in your application. You can
mix in whatever traits you want, and run any Scala code you want from inside
the `init` method:

```scala
import org.scalatra.LifeCycle
import javax.servlet.ServletContext

// Import the trait:
import com.yourdomain.yourapp.DatabaseInit

// Mixing in the trait:
class ScalatraBootstrap extends LifeCycle with DatabaseInit {

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

You can set the application's environment in the following ways:

1. The preferred method: as an init-param in the Scalatra Bootstrap file.
2. As an init-param in web.xml.
3. As a system property: this is most commonly set with a `-D` option on the
command line: `java -Dorg.scalatra.environment=development`

When you deploy your application to a production environment, you'll typically
want to change its environment to "production".

There are a few ways you can accomplish this.

#### Environment variables

If you're using Scalatra 2.1 or better, you can set it in your ScalatraBootstrap
file based on an environment variable that's present on production machines.

#### Massaging your WAR file

If you're using Scalatra 2.0.x or just happen to like XML configuration, you can
use a post-hook in the xsbt-web-plugin to
[massage the contents of your WAR file](https://github.com/JamesEarlDouglas/xsbt-web-plugin/wiki/Massage-WAR)
during packaging.

Load the Web.xml file and replace the value for `org.scalatra.environment` using
Scala's standard XML tools.

### Changing the port in development

Add `port in container.Configuration := 8081` to `project/build.scala` if you would
like your Scalatra app to run on something other than the default port (8080).

_You may need to add the following imports if you get errors upon adding the configuration above:_
```scala
import com.earldouglas.xsbtwebplugin.PluginKeys._
import com.earldouglas.xsbtwebplugin.WebPlugin._
```
