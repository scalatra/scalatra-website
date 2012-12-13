---
layout: default
title: Scalatra | Deploying to Heroku
---

<div class="page-header">
  <h1>Deploying to Heroku</h1>
</div>

[Heroku](http://www.heroku.com/) is a cloud application platform that makes it easy to deploy and scale applications. With the right project setup, deploying your application becomes as easy as `git push`.

----

## 1. Sign up for a free a [free account](https://api.heroku.com/signup).

## 2. Install the [Heroku Toolbelt](https://toolbelt.herokuapp.com/).

## 3. Set up a project.

Use the usual Scalatra giter8 template, and initialize it as a Git repo.

```sh
$ g8 scalatra/scalatra-sbt -b develop
```

## 4. Tweak the app for Heroku

### Make Jetty embeddable

Open `build.sbt` in the root of your project. You will find two lines like these:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "8.1.7.v20120910" % "container",

"org.eclipse.jetty.orbit" % "javax.servlet" % "3.0.0.v201112011016" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
```

Those are basically right, but we need to add `compile` scope because Heroku is not a servlet host. It can only run your app via an embedded Jetty server you provide. So replace the two lines above with these two:

```scala
"org.eclipse.jetty" % "jetty-webapp" % "8.1.7.v20120910" % "compile;container",

"org.eclipse.jetty.orbit" % "javax.servlet" % "3.0.0.v201112011016" % "compile;container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
```

### Escape sbt

You don't want to use sbt to run your app in production. We'll install an sbt plugin that will create a start script during compilation. Heroku will use that start script.

Tell sbt where to find the plugin by adding this line to `project/plugins.sbt` (you may need to create the file first):

```scala
addSbtPlugin("com.typesafe.startscript" % "xsbt-start-script-plugin" % "0.5.3")
```

Tell sbt how to use the plugin by adding this line to `build.sbt`:

```scala
seq(com.typesafe.startscript.StartScriptPlugin.startScriptForClassesSettings: _*)
```

### Tell Heroku to use the generated start script

Create a file named `Procfile` in the root of your application.
Add this line:

```
web: target/start
```

### Create a `main` method

Since Heroku launches your app as a vanilla Java/Scala project, you need to create a `main` method that launches the servlet.

Create `src/main/scala/JettyLauncher.scala` with this code:

```scala
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.servlet.{ DefaultServlet, ServletContextHandler }
import org.eclipse.jetty.webapp.WebAppContext

object JettyLauncher {
  def main(args: Array[String]) {
    val port = if(System.getenv("PORT") != null) System.getenv("PORT").toInt else 8080

    val server = new Server(port)
    val context = new WebAppContext()
    context setContextPath "/"
    context.setResourceBase("src/main/webapp")
    context.addServlet(classOf[com.example.app.MyScalatraServlet], "/*")
    context.addServlet(classOf[DefaultServlet], "/")

    server.setHandler(context)

    server.start
    server.join
  }

}
```

## 5. Test your configuration
We're done tweaking the project, but we should probably test that it works before deploying to Heroku.

```sh
$ cd [app root]
$ ./sbt
> container:start
> browse
```

If `browse` doesn't launch your browser, manually open [http://localhost:8080/](http://localhost:8080/) in your browser.

If you see a webpage instead of an error message, you're in business.

## 6. Deploy

If you haven't set up your project as a Git repo, do so.

```sh
$ cd [app root]
$ chmod u+x sbt
$ git init
$ git add .
$ git commit -m 'first commit'
```

Log into Heroku.

```sh
$ heroku login
```

Create your Heroku endpoint and deploy to it.

```sh
$ cd [app root]
$ heroku create --stack cedar
$ git push heroku master
```

After a couple minutes of streaming output, the last few lines will look like this:

```
-----> Discovering process types
       Procfile declares types -> web
-----> Compiled slug size: 43.4MB
-----> Launching... done, v5
       http://polar-atoll-9149.herokuapp.com deployed to Heroku
              
To git@heroku.com:polar-atoll-9149.git
* [new branch]      master -> master
```

Open your browser to to the URL provided right before `deployed to Heroku` in the output.
