---
aliases:
  - /2.3/guides/deployment/servlet-container.html
title: Deploying to servlet containers | Deployment | Scalatra
---

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  If you're coming from a non-Java background, you may find the subject of
  servlet containers and JVM deployments to be unnecessarily frightening. Don't
  despair. Despite all the mystery which surrounds them, servlet deployments are
  extremely simple. You will be surprised at how easy it is!
</div>

### Compatibility

Scalatra 2.2 runs on any servlet container which supports the Servlet 3.0 standard.

If you're using an older container, you'll need to run the older Scalatra 2.0.x series.

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

#### Your own servlet container

Now that you've got a WAR file, you can run it in a servlet container - there are certainly
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
Request body params dont get parsed in 'put(/:resource)' api when deploying scalatra app as a WAR in Tomcat 7. To make your PUT work, set the connector attribute 'parseBodyMethods' to 'POST,PUT' in server.xml of tomcat. The same goes for PATCH.
</div>

Your app should now be running at [http://localhost:8080/](http://localhost:8080/)
