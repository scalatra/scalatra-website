---
aliases:
  - /2.4/guides/views/scalate.html
layout: oldguide
title: Scalate
---

If you're using Scalatra to build a web application (as opposed to an API), chances are you'll
want to render HTML layouts, page content, and re-usable fragments or partials. Like many other
frameworks, we refer to HTML templates as "views".

Scalatra can render views in two main ways.

1. Inline HTML, returned directly from an action.
1. Using the ScalateSupport helper trait which comes built into the default Scalatra g8 template.

## Introducing Scalate

Scalatra uses an extremely powerful templating engine, [Scalate][scalate].
It supports multiple template styles. We think it's one of the best
template engines going - it's extremely fast, flexible, and feature-rich.

[scalate]: http://scalate.github.io/scalate/documentation/user-guide.html

Some of Scalate's all-star features include:

*   Custom template evaluation scopes / bindings
*   Ability to pass locals to template evaluation
*   Support for passing a block to template evaluation for "yield"
*   Backtraces with correct filenames and line numbers
*   Template file caching and reloading

Scalate includes support for multiple templateing styles, including
[SSP][ssp] (similar to Velocity or ERB), [SCAML][scaml] (a Scala HAML variant),
[Mustache][mustache], and [Jade][jade] (another HAML variant). Except for
Mustache, templates are strongly typed, so your compiler can save
you time by telling you when you make a mistake in your views.

[ssp]: http://scalate.github.io/scalate/documentation/ssp-reference.html
[scaml]: http://scalate.github.io/scalate/documentation/scaml-reference.html
[mustache]: http://scalate.github.io/scalate/documentation/mustache.html
[jade]: http://scalate.github.io/scalate/documentation/jade.html

All you need to get started is `Scalate`, which is included in Scalatra.
By default, Scalatra looks for views in the `views` directory in your application root.

There are two ways to use Scalate. You can use the ScalateSupport helpers,
or call Scalate directly. Either way, you'll need to extend your servlet
with `ScalateSupport`, like this:

```scala
class YourServlet extends ScalatraServlet with ScalateSupport {
  get("/") {
    // render your views in the action (see below)
  }
}
```


### ScalateSupport helpers

The easiest way of using Scalate is to use Scalatra's ScalateSupport helpers.

Each possible kind of Scalate template (mustache, scaml, jade, ssp) has a
corresponding helper which can be used to find the template file.

Basic usage:

```scala
get("/") {
  contentType="text/html"

  ssp("/index")
}
```

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
When using the scalate helper methods, it is not required to having a leading
`/`, so `ssp("index")` would work just as well as `ssp("/index")`.
</div>

You can also use a little bit less magic to do the same thing, using a method
called `layoutTemplate`. This method allows you to render any type of Scalate
template. You need to give the full path to the template, starting from the  WEB-INF
directory:

```scala
get("/") {
  contentType="text/html"

  layoutTemplate("/WEB-INF/templates/views/index.ssp")
}
```

<span class="label label-warning"><i class="icon-warning-sign icon-white"></i> Watch out!</span>
When using `layoutTemplate`, you *must* prefix your view paths with a relative
`/` character. So, `layoutTemplate("/WEB-INF/templates/views/foo.ssp")` is good,
`layoutTemplate("WEB-INF/templates/views/foo.ssp)` will fail.

#### Passing parameters to views

<div class="alert alert-info">
<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
If you're coming from a dynamic language, pay attention to this next bit,
  because it may surprise you: you need to explicitly declare variables inside
  your views.
</div>

As mentioned previously, Scalate templates are strongly typed (except for
Mustache, which isn't). This makes them extremely fast, and helps your productivity
by letting the compiler tell you when something's wrong. It also means that any
controller variables that you want to access in your views need to be explicitly
sent to the view by your controller. They need to be declared in the views before
they can be used.

View parameters are passed to your views using a Seq(String, Any) after
the path to the template file. The simplest example might look like this:

```scala
get("/") {
  contentType="text/html"

  ssp("/index", "foo" -> "uno", "bar" -> "dos")
}
```

The view for this action needs to declare variables for `foo` and `bar`, which would
look like:

```html
<%@ val foo: String %>
<%@ val bar: String %>
<p>Foo is <%= foo %></p>
<p>Bar is <%= bar %></p>
```

The view can also receive parameters from the `templateAttributes` helper. This enables you to globally pass parameters from a `before` handler or inside of your route action if you have multiple steps for creating the parameters. An example would look like:

```scala
before(){
  if(isAuthenticated) {
    templateAttributes("user") = Some(user)
  }
}
```

#### Layouts

Scalatra looks for layouts in the `webapp/layouts/` directory, and inserts the rendered
view for the current action into the template at the point you specify. If you're using
`SSP`, your layout might look something like this:

```html
  <%@ val body: String %>
  <html>
    <head>..</head>
    <body>
      <%= unescape(body) %>
    </body>
  </html>
```

The specific view for your action will be rendered at the
`<%= unescape(body) %>` statement.

#### Default layouts

By convention, Scalatra uses a default layout at `WEB-INF/layouts/default.xx` (where xx
is one of the scalate template types). If you are using ssp, for instance, and
you put a default.ssp file at WEB-INF/layouts/default.ssp, it will
automatically be used. In that case, you can simply call `ssp("/index")` and the
response will render within the default layout.

#### <a id="layouts"></a>Specifying an alternate layout

The `layout` key passed from your actions is somewhat special, as it's used by
Scalate to identify the layout file, which wraps a standard layout around the
output for the current action.

```scala
get("/") {
  contentType="text/html"

  jade("/index", "layout" -> "WEB-INF/layouts/app.jade", "foo" -> "uno", "bar" -> "dos")
}
```

#### Disabling layouts

To disable a layout for certain templates, Scalate accepts an empty `layout`
parameter:

```scala
get("/") {
  // This template will render without a layout.
  jade("/index", "layout" -> "", "foo" -> "uno", "bar" -> "dos")
}
```

#### Rendering a 404 page

You may need to render a 404 page when Scalatra can't find a route.

You can do this by putting the `notFound` helper into your servlet. Here's
how it looks, when using the ScalateSupport helpers to render the page.

```scala
notFound {
  findTemplate(requestPath) map { path =>
    contentType = "text/html"
    layoutTemplate(path)
  } orElse serveStaticResource() getOrElse resourceNotFound()
}
```


### Using Scalate directly

Some people like to call Scalate methods directly, bypassing the
(relatively minimal) magic of the ScalateSupport helpers.

Scalate can be called directly, using the
`templateEngine.layout("templateName")` method, like this:

```scala
get("/") {
  templateEngine.layout("index.ssp")
  // renders webapp/index.ssp

  // OR you can tell Scalate to look in a sub-directory
  templateEngine.layout("/dogs/index.ssp")
  // would instead render webapp/dogs/index.ssp
}
```

When using Scalate directly, Scalatra will look for your template files
in the `webapp` folder of your application (which is found under `src/main/`
in the project tree).

#### Rendering a 404 page using Scalate

You may need to render some other page when Scalatra can't find a route.

Using Scalate directly, it looks a little bit different than when you're using
the ScalateSupport helpers:

```scala
class MyScalatraFilter extends ScalatraFilter with ScalateSupport {
  notFound {
    // If no route matches, then try to render a Scaml template
    val templateBase = requestPath match {
      case s if s.endsWith("/") => s + "index"
      case s => s
    }
    val templatePath = "/WEB-INF/templates/" + templateBase + ".scaml"
    servletContext.getResource(templatePath) match {
      case url: URL =>
        contentType = "text/html"
        templateEngine.layout(templatePath)
      case _ =>
        filterChain.doFilter(request, response)
    }
  }
}
```

### Scalate error page

Mixing in ScalateSupport enables the Scalate error page for any uncaught
exceptions.  This page renders the template source with the error highlighted.
To disable this behavior, override `isScalateErrorPageEnabled`:

```scala
override def isScalateErrorPageEnabled = false
```

### Further reading

For more information on Scalate, please refer to the [Scalate User's guide][sug].
It has advice about layouts, partials, how to DRY up layout code, making Scalate
work with your IDE or text editor, and an extensive set of examples.

[sug]: http://scalate.github.io/scalate/documentation/user-guide.html
