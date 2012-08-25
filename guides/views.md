---
layout: default
title: Scalatra Guides | Views
---


Views
=====

Scalatra can render views in three main ways.

1. Inline HTML
1. Using Scalate directly
1. Using ScalateSupport helpers, with a bit more "magic"

### Inline HTML

The simplest method of rendering a view is by using inline HTML:
{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  <html>
  <head><title>Test</title></head>
  <body>Test Body for {uri("/")}</body>
  </html>
}
{pygmentize}

Note the use of the curly braces on the `{uri("/")}` part of the inlined view.
This tells Scalatra to render Scala code.

### Scalate

Scalatra can use the incredibly powerful templating engine,
[Scalate][scalate]. It is designed to be a thin interface for frameworks
that want to support multiple template engines.

[scalate]: http://scalate.fusesource.org/documentation/user-guide.html

Some of Scalate's all-star features include:

*   Custom template evaluation scopes / bindings
*   Ability to pass locals to template evaluation
*   Support for passing a block to template evaluation for "yield"
*   Backtraces with correct filenames and line numbers
*   Template file caching and reloading

Scalate includes support for some of the best engines available, such as
[SSP][ssp], [SCAML][scaml], [Mustache][mustache] and [Jade][jade].

[ssp]: http://scalate.fusesource.org/documentation/ssp-reference.html
[scaml]: http://scalate.fusesource.org/documentation/scaml-reference.html
[mustache]: http://scalate.fusesource.org/documentation/mustache.html
[jade]: http://scalate.fusesource.org/documentation/jade.html

All you need to get started is `Scalate`, which is included in Scalatra. Views
by default look in the `views` directory in your application root.

There are two ways to use Scalate. Both of them require you to extend your
servlet with `ScalateSupport`:
{pygmentize:: scala}
class YourServlet extends ScalatraServlet with ScalateSupport {
  // your class here
}
{pygmentize}

### Using Scalate directly

Scalate can be called directly, using the
`templateEngine.layout("templateName")` method, like this:

{pygmentize:: scala}
get("/") {
  templateEngine.layout("index.ssp")
  // renders webapp/index.ssp
  // OR look in a sub-directory

  templateEngine.layout("/dogs/index.ssp")
  // would instead render webapp/dogs/index.ssp
}
{pygmentize}

When using Scalate directly, Scalatra will look for your template files
in the `webapp` folder of your application (which is found under `src/main/`
in the project tree).

Another default convention of Scalatra is the layout, which automatically
looks for a `webapp/layout/default.xx` template file to render before loading any
other views (where `xx` is a Scalate template suffix type). If you're using
`SSP`, your `webapp/layout/default.ssp` would look something like this:

{pygmentize:: html}
<%@ var yield: String %>
<html>
  <head>..</head>
  <body>
    <%= yield %>
  </body>
</html>
{pygmentize}

### ScalateSupport helpers

The second way of using Scalate is to use Scalatra's ScalateSupport helpers, which
are a bit more "magic" than calling Scalate directly.

Basic usage:
{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  layoutTemplate("/WEB-INF/views/index.ssp")
}
{pygmentize}

When using `layoutTemplate`, you *must* prefix your view paths with a relative
`/` character. So, `layoutTemplate("/WEB-INF/views/foo.ssp")` is good,
`layoutTemplate("WEB-INF/views/foo.ssp)` will fail.

Rendering with a different layout:
{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  layoutTemplate("/WEB-INF/views/index.ssp", "layout" -> "/WEB-INF/layouts/app.ssp")
}
{pygmentize}

Each possible kind of Scalate template (mustache, scaml, jade, ssp) has a
corresponding helper which can be used to find the template file, without a
suffix, and without the `WEB-INF/views` part of the path. The above example can be
written as:

{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  ssp("/index", "layout" -> "WEB-INF/layouts/app.ssp")
}
{pygmentize}

When using the scalate helper methods, it is not required to having a leading
`/`, so `ssp("index")` would work just as well as `ssp("/index")`.

### Passing parameters to templates

Parameters may be passed to your templates using a Seq(String, Any) after the
path to the template file. The simplest example might look like this:

{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  layoutTemplate("/WEB-INF/views/index.ssp", "foo" -> "uno", "bar" -> "dos")
}
{pygmentize}

Putting it all together, in a scaml example (alternatively use mustache, ssp,
or jade):
{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  scaml("/index", "layout" -> "WEB-INF/layouts/app.scaml", "foo" -> "uno", "bar" -> "dos")
}
{pygmentize}

### Layouts

The `layout` key is somewhat special, as it's used by scalate to identify the
layout file, which wraps a standard layout around the output for the current
action.

If you want, you can set off your `layout` parameter from the others, perhaps
by doing something like this (in jade this time):

{pygmentize:: scala}
def get("/") {
  contentType="text/html"

  jade("/index",("layout" -> "WEB-INF/layouts/app.jade"), "foo" -> "uno", "bar" -> "dos")
}
{pygmentize}

#### Default layouts

Scalatra sets a default layout at `WEB-INF/layouts/default.xx` (where xx
is one of the scalate template types). If you are using ssp, for instance, and
you put a default.ssp file in WEB-INF/layouts/default.ssp, it will
automatically be used. In this case, you can simply call `ssp("/index")` and the
response will render within the default layout.

To disable a layout for certain templates, Scalate accepts an empty `layout`
attribute:

{pygmentize:: scala}
def get("/") {
  // This template will render without a layout.
  jade("/index", "layout" -> "", "foo" -> "uno", "bar" -> "dos")
}
{pygmentize}

Your layout file itself might look something like this:

{pygmentize:: html}
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
{pygmentize}

In this layout, the template output for the current action will be inserted
at the `${unescape(body)}` directive.


### Rendering a 404 page using the `notFound` handler

You may need to render some other page when Scalatra can't find a route.

Using Scalate directly:

{pygmentize:: scala}
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
{pygmentize}

Or more simply, using the Scalate helpers:

{pygmentize:: scala}
notFound {
  findTemplate(requestPath) map { path =>
    contentType = "text/html"
    layoutTemplate(path)
  } orElse serveStaticResource() getOrElse resourceNotFound()
}
{pygmentize}

### Further reading

For more information on Scalate, please refer to the [Scalate User's guide][sug].
It has advice about layouts, partials, how to DRY up layout code, making Scalate
work with your IDE or text editor, and an extensive set of examples.

[sug]: http://scalate.fusesource.org/documentation/user-guide.html
