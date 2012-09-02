---
layout: default
title: Scalatra guides | Views
---

<div class="page-header">
  <h1>Views</h1>
</div>

If you're using Scalatra to build a web application (as opposed to an API), chances are you'll
want to render HTML layouts, page content, and re-usable fragments or partials. Like many other
frameworks, we refer to the process of templating HTML output as "views".

Scalatra can render views in three main ways.

1. Inline HTML, returned directly from an action.
1. Using the ScalateSupport helpers which are built into Scalatra.
1. Using Scalate directly, calling Scalate functionality without using Scalatra's built-in helpers.

## Inline HTML

The simplest method of rendering a view is by using inline HTML.

Unlike a lot of other frameworks, Scalatra can output XML literals directly as a return
value from an action: 

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    <html>
    <head><title>Test</title></head>
    <body>Test Body for {uri("/")}</body>
    </html>
  }

{% endhighlight %}


Note the use of the curly braces on the `{uri("/")}` part of the inlined view.
This tells Scalatra to render Scala code.

This would be a very poor way to structure views for a large application, but it might
be handy if your application is quite simple (or you're just cranking out a quick prototype).

Normally you'll want more structure than inline HTML can provide, so that you can separate
your views from your controller actions and routing. 


## Introducing Scalate

Scalatra uses an extremely powerful templating engine, [Scalate][scalate]. 
It supports multiple template styles. We think it's one of the best
template engines going - it's extremely fast, flexible, and feature-rich.

[scalate]: http://scalate.fusesource.org/documentation/user-guide.html

Some of Scalate's all-star features include:

*   Custom template evaluation scopes / bindings
*   Ability to pass locals to template evaluation
*   Support for passing a block to template evaluation for "yield"
*   Backtraces with correct filenames and line numbers
*   Template file caching and reloading

Scalate includes support for some of the best engines available, such as
[SSP][ssp] (similar to ERB), [SCAML][scaml] (a Scala HAML variant), 
[Mustache][mustache] and [Jade][jade] (another HAML variant).

[ssp]: http://scalate.fusesource.org/documentation/ssp-reference.html
[scaml]: http://scalate.fusesource.org/documentation/scaml-reference.html
[mustache]: http://scalate.fusesource.org/documentation/mustache.html
[jade]: http://scalate.fusesource.org/documentation/jade.html

All you need to get started is `Scalate`, which is included in Scalatra. 
By default, Scalatra looks in the `views` directory in your application root.

There are two ways to use Scalate. You can use the ScalateSupport helpers,
or call Scalate directly. Either way, you'll need to extend your servlet 
with `ScalateSupport`, like this:

{% highlight scala %}

  class YourServlet extends ScalatraServlet with ScalateSupport {
    // your class here
  }

{% endhighlight %}


### ScalateSupport helpers

The second way of using Scalate is to use Scalatra's ScalateSupport helpers, which
are a bit more "magic" than calling Scalate directly.

Basic usage:

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    layoutTemplate("/WEB-INF/views/index.ssp")
  }

{% endhighlight %}

When using `layoutTemplate`, you *must* prefix your view paths with a relative
`/` character. So, `layoutTemplate("/WEB-INF/views/foo.ssp")` is good,
`layoutTemplate("WEB-INF/views/foo.ssp)` will fail.

Rendering with a different layout:
{% highlight scala %}

  def get("/") {
    contentType="text/html"

    layoutTemplate("/WEB-INF/views/index.ssp", "layout" -> "/WEB-INF/layouts/app.ssp")
  }

{% endhighlight %}

Each possible kind of Scalate template (mustache, scaml, jade, ssp) has a
corresponding helper which can be used to find the template file, without a
suffix, and without the `WEB-INF/views` part of the path. The above example can be
written as:

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    ssp("/index", "layout" -> "WEB-INF/layouts/app.ssp")
  }

{% endhighlight %}

When using the scalate helper methods, it is not required to having a leading
`/`, so `ssp("index")` would work just as well as `ssp("/index")`.

#### Passing parameters to templates

Parameters may be passed to your templates using a Seq(String, Any) after the
path to the template file. The simplest example might look like this:

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    layoutTemplate("/WEB-INF/views/index.ssp", "foo" -> "uno", "bar" -> "dos")
  }

{% endhighlight %}

Putting it all together, in a scaml example (alternatively use mustache, ssp,
or jade):

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    scaml("/index", "layout" -> "WEB-INF/layouts/app.scaml", "foo" -> "uno", "bar" -> "dos")
  }

{% endhighlight %}

#### Layouts

Scalatra automatically looks for layouts in a `webapp/layout/default.xx` 
file to render before loading any other views (where `xx` is a Scalate 
template suffix type). If you're using `SSP`, your `webapp/layout/default.ssp` 
could look something like this:

{% highlight html %}

  <%@ var yield: String %>
  <html>
    <head>..</head>
    <body>
      <%= yield %>
    </body>
  </html>

{% endhighlight %}

#### Specifying which layout to use

The `layout` key passed from your actions is somewhat special, as it's used by 
scalate to identify the layout file, which wraps a standard layout around the 
output for the current action.

If you want, you can set off your `layout` parameter from the others, perhaps
by doing something like this (in jade this time):

{% highlight scala %}

  def get("/") {
    contentType="text/html"

    jade("/index",("layout" -> "WEB-INF/layouts/app.jade"), "foo" -> "uno", "bar" -> "dos")
  }

{% endhighlight %}

#### Setting a default layout

Scalatra sets a default layout at `WEB-INF/layouts/default.xx` (where xx
is one of the scalate template types). If you are using ssp, for instance, and
you put a default.ssp file in WEB-INF/layouts/default.ssp, it will
automatically be used. In this case, you can simply call `ssp("/index")` and the
response will render within the default layout.

#### Disabling layouts

To disable a layout for certain templates, Scalate accepts an empty `layout`
attribute:

{% highlight scala %}

  def get("/") {
    // This template will render without a layout.
    jade("/index", "layout" -> "", "foo" -> "uno", "bar" -> "dos")
  }

{% endhighlight %}

Your layout file itself might look something like this:

{% highlight html %}

  <%@ var body: String %>
  <%@ var title: String = "Some Default Title" %>
  <html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <p>layout header goes here...</p>

    ${unescape(body)}

    <p>layout footer goes here...</p>
  </body>
  </html>

{% endhighlight %}

In this layout, the template output for the current action will be inserted
at the `${unescape(body)}` directive.

#### Rendering a 404 page

You may need to render a 404 page when Scalatra can't find a route. 

You can do this by putting the `notFound` helper into your servlet. Here's 
how it looks, when using the ScalateSupport helpers to render the page.

{% highlight scala %}

  notFound {
    findTemplate(requestPath) map { path =>
      contentType = "text/html"
      layoutTemplate(path)
    } orElse serveStaticResource() getOrElse resourceNotFound()
  }

{% endhighlight %}


### Using Scalate directly

Some people like to call Scalate methods directly, preferring to bypass the
(relatively minimal) magic of the ScalateSupport helpers. 

Scalate can be called directly, using the
`templateEngine.layout("templateName")` method, like this:

{% highlight scala %}

  get("/") {
    templateEngine.layout("index.ssp")
    // renders webapp/index.ssp
    // OR look in a sub-directory

    templateEngine.layout("/dogs/index.ssp")
    // would instead render webapp/dogs/index.ssp
  }

{% endhighlight %}

When using Scalate directly, Scalatra will look for your template files
in the `webapp` folder of your application (which is found under `src/main/`
in the project tree).

#### Rendering a 404 page

You may need to render some other page when Scalatra can't find a route.

Using Scalate directly, it looks a little bit different than when you're using 
the ScalateSupport helpers:

{% highlight scala %}

  class MyScalatraFilter extends ScalatraFilter with ScalateSupport {
    notFound {
      // If no route matches, then try to render a Scaml template
      val templateBase = requestPath match {
        case s if s.endsWith("/") => s + "index"
        case s => s
      }
      val templatePath = "/WEB-INF/scalate/templates/" + templateBase + ".scaml"
      servletContext.getResource(templatePath) match {
        case url: URL =>
          contentType = "text/html"
          templateEngine.layout(templatePath)
        case _ =>
          filterChain.doFilter(request, response)
      }
    }
  }

{% endhighlight %}

### Further reading

For more information on Scalate, please refer to the [Scalate User's guide][sug].
It has advice about layouts, partials, how to DRY up layout code, making Scalate
work with your IDE or text editor, and an extensive set of examples.

[sug]: http://scalate.fusesource.org/documentation/user-guide.html
