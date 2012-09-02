---
layout: default
title: Scalatra guides | Routes and actions
---

<div class="page-header">
  <h1>Routes &amp; actions</h1>
</div>

All web applications need a way to match up the incoming HTTP request with some code to execute on the server. In Scalatra, this is done using _routes_ and _actions_.

If somebody makes a POST request to your application, at *http://www.yourapp.org/articles*, you might want to invoke code on the server which will look at the information contained in the incoming request, and use it to create a new *Article* object. The fact that it's a _POST_ request, and the request path is _/articles_, are _route_ information. The code that you execute is the _action_.

## Routes

In Scalatra, a route is an HTTP method (GET, PUT, POST, or DELETE) paired with a URL matching pattern. If you set your application up using RESTful conventions, your controller might look something like this:

{% highlight scala %}

class Blog extends ScalatraServlet {


    get("/articles/:id") {  //  <= this is a route
      // this is an action
      // this action would show the article which has the specified :id
    }

    post("/articles") {
      // this action would submit/create an article
    }

    put("/articles/:id") {
      // update the article which has the specified :id
    }

    delete("/articles/:id") {
      // delete the article with the specified :id
    }

}

{% endhighlight %}

Those 4 example routes, and the actions inside the route blocks, could be the basis of a simple blogging system. The examples just stub out the actions - in a real application, you'd replace the  `// comments` with code to save and retrieve [models](models.html), and show HTML [views](views.html).

### Route order

The first matching route is invoked. Routes are matched from the *bottom up*.

<span class="label label-warning"><i class="icon-warning-sign icon-white"></i> Watch out!</span> This is the opposite of Sinatra.
Route definitions are executed as part of a Scala constructor; by matching
from the bottom up, routes can be overridden in child classes.

### Named parameters

Route patterns may include named parameters (see below for more on parameter handling):

{% highlight scala %}

    get("/hello/:name") {
      // Matches "GET /hello/foo" and "GET /hello/bar"
      // params("name") is "foo" or "bar"
      <p>Hello, {params("name")}</p>
    }

{% endhighlight %}

### Wildcards

Route patterns may also include wildcard parameters, accessible through the
`splat` key.

{% highlight scala %}

    get("/say/*/to/*") {
      // Matches "GET /say/hello/to/world"
      multiParams("splat") // == Seq("hello", "world")
    }

    get("/download/*.*") {
      // Matches "GET /download/path/to/file.xml"
      multiParams("splat") // == Seq("path/to/file", "xml")
    }

{% endhighlight %}

### Regular expressions

The route matcher may also be a regular expression.  Capture groups are
accessible through the `captures` key.

{% highlight scala %}

    get("""^\/f(.*)/b(.*)""".r) {
      // Matches "GET /foo/bar"
      multiParams("captures") // == Seq("oo", "ar")
    }
{% endhighlight %}

### Rails-like pattern matching

By default, route patterns parsing is based on Sinatra.  Rails has a similar,
but not identical, syntax, based on Rack::Mount's Strexp.  The path pattern
parser is resolved implicitly, and may be overridden if you prefer an
alternate syntax:

{% highlight scala %}

    import org.scalatra._

    class RailsLikeRouting extends ScalatraFilter {
      implicit override def string2RouteMatcher(path: String) =
        RailsPathPatternParser(path)

      get("/:file(.:ext)") { // matched Rails-style }
    }
{% endhighlight %}

### Path patterns in the REPL

If you want to experiment with path patterns, it's very easy in the [REPL][repl].

    scala> import org.scalatra.SinatraPathPatternParser
    import org.scalatra.SinatraPathPatternParser

    scala> val pattern = SinatraPathPatternParser("/foo/:bar")
    pattern: PathPattern = PathPattern(^/foo/([^/?#]+)$,List(bar))

    scala> pattern("/y/x") // doesn't match
    res1: Option[MultiParams] = None

    scala> pattern("/foo/x") // matches
    res2: Option[MultiParams] = Some(Map(bar -> ListBuffer(x)))

Alternatively, you may use the `RailsPathPatternParser` in place of the
`SinatraPathPatternParser`.

[repl]: http://www.scala-lang.org/node/2097

### Conditions

Routes may include conditions.  A condition is any expression that returns
Boolean.  Conditions are evaluated by-name each time the route matcher runs.

{% highlight scala %}

    get("/foo") {
      // Matches "GET /foo"
    }

    get("/foo", request.getRemoteHost == "127.0.0.1") {
      // Overrides "GET /foo" for local users
    }
{% endhighlight %}

Multiple conditions can be chained together.  A route must match all
conditions:

{% highlight scala %}

    get("/foo", request.getRemoteHost == "127.0.0.1", request.getRemoteUser == "admin") {
      // Only matches if you're the admin, and you're localhost
    }
{% endhighlight %}

No path pattern is necessary.  A route may consist of solely a condition:

{% highlight scala %}

    get(isMaintenanceMode) {
      <h1>Go away!</h1>
    }
{% endhighlight %}

## Actions

Each route is followed by an action.  An Action may return any value, which
is then rendered to the response according to the following rules.

<dl class="dl-horizontal">
<dt>ActionResult</dt>
<dd>Sets status, body and headers. After importing
<code>org.scalatra.ActionResult._</code>, you can return 200 OK, 404 Not Found
and other responses by referencing them by their descriptions. See the <span class="badge badge-info"> <i class="icon-bookmark icon-white"></i>ActionResult example</span> code (below) for an example.
</dd>
</dl>
<dl class="dl-horizontal">
<dt>Array[Byte]</dt>
<dd>If no content-type is set, it is set to <code>application/octet-stream</code>.
The byte array is written to the response's output stream.</dd>
<dt>NodeSeq</dt>
<dd>If no content-type is set, it is set to <code>text/html</code>.  The node
sequence is converted to a string and written to the response's writer.</dd>
<dt>Unit</dt>
<dd>This signifies that the action has rendered the entire response, and
no further action is taken.</dd>
<dt>Any</dt>
<dd> For any other value, if the content type is not set, it is set to
<code>text/plain</code>.  The value is converted to a string and written to the
response's writer.</dd>
</dl>

This behavior may be customized for these or other return types by overriding
`renderResponse`.

<span class="badge badge-info"> <i class="icon-bookmark icon-white"></i>ActionResult example</span>
{% highlight scala %}
    get("/file/:id") {
      fileService.find(params("id")) match {
        case Some(file) => Ok(file)
        case None       => NotFound("Sorry, the file could not be found")
       }
     }
{% endhighlight %}


### Parameter handling

Incoming HTTP request parameters become available to your actions through
two methods: `multiParams` and `params`.

<dl class="dl-horizontal">
<dt>multiParams</dt>
<dd>a result of merging the standard request params (query
string or post params) with the route parameters extracted from the route
matchers of the current route. The default value for an unknown param is the
empty sequence. Keys return <code>Seq</code>uences of values.</dd>
<dt>params</dt>
<dd>a special, simplified view of <code>multiParams</code>, containing only the
head element for any known param, and returning the values as Strings.</dd>
</dl>

#### A params example

As an example, let's hit a URL with a GET like this:

{% highlight html %}

  /articles/52?foo=uno&bar=dos&baz=three&foo=anotherfoo

{% endhighlight %}

<span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
Look closely: there are two "foo" keys in there.

Assuming there's a matching route at `/articles/:id`, we get the following
results inside the action:

{% highlight scala %}

  get("/articles/:id") {
    params("id") // => "52"
    params("foo") // => "uno" (discarding the second "foo" parameter value)
    params("unknown") // => generates a NoSuchElementException
    params.get("unknown") // => None - this is what Scala does with unknown keys in a Map

    multiParams("id") // => Seq("52")
    multiParams("foo") // => Seq("uno", "anotherfoo")
    multiParams("unknown") // => an empty Seq
  }

{% endhighlight %}

#### params.getOrElse

You can set defaults for parameter values easily by using `params.getOrElse`.

Let's say you wanted to require an :author name param, and set a :page value
to 1 by default. If you don't receive an :author, you want to stop execution.
You could do it like this:

{% highlight scala %}

  get("/articles-by/:author/:page") {
    val author:String = params.getOrElse("author", halt(400))
    val page:Int = params.getOrElse("page", "1").toInt
    // now do stuff with your params
  }

{% endhighlight %}

### Enabling support for PUT and DELETE requests

Scalatra supports all of the HTTP verbs: `GET` and `POST`, which are supported by
browser clients, but also `PUT` and `DELETE`, which are not.

Many client libraries use non-standard but simple conventions to indicate
that they would like the request to be considered as a `PUT` or `DELETE` instead of
a POST: for example, jQuery adds a `X-HTTP-METHOD-OVERRIDE` header to the request.

Other clients and frameworks often indicate the same thing by adding a
`_method=put` or `_method=delete` parameter to a POST body.

Scalatra will look for these conventions on incoming requests and transform
the request method automatically if you add the `MethodOverride` trait into your
servlet or filter:

{% highlight scala %}

  class MyFilter extends ScalatraFilter with MethodOverride {

    // POST to "/foo/bar" with params "id=2" and "_method=put" will hit this route:
    put("/foo/bar/:id") {
      // update your resource here
    }
  }

{% endhighlight %}


### Filters

Scalatra offers a way for you too hook into the request chain of your
application via `before` and `after` filters, which both accept a
block to yield. Filters optionally take a URL pattern to match to the request.


#### before

The `before` method will let you pass a block to be evaluated **before** _each_
and _every_ route gets processed.

{% highlight scala %}

  before() {
    MyDb.connect
    contentType="text/html"
  }

  get("/") {
    val list = MyDb.findAll()
    templateEngine.layout("index.ssp", list)
  }

{% endhighlight %}

In this example, we've set up a `before` filter to connect using a contrived
`MyDb` module, and set the `contentType` for all requests to `text/html`.

#### after

The `after` method lets you pass a block to be evaluated **after** _each_ and
_every_ route gets processed.

{% highlight scala %}

  after() {
    MyDb.disconnect
  }

{% endhighlight %}

As you can see from this example, we're asking the `MyDB` module to
disconnect after the request has been processed.

#### Pattern matching

Filters optionally take a pattern to be matched against the requested URI
during processing. Here's a quick example you could use to run a contrived
`authenticate!` method before accessing any "admin" type requests.

{% highlight scala %}

  before("/admin/*") {
    basicAuth
  }

  after("/admin/*") {
    user.logout
  }

{% endhighlight %}


### Processing order

Route actions, errors and filters run in the following order:

1. `before` filters.
2. Routes and actions.
3. If an exception is thrown during the `before` filter or route actions, it is
   passed to the `errorHandler` function, and its result becomes the action result.
4. `after` filters.
5. The response is rendered.


### Handlers

Handlers are top-level methods available in Scalatra to take care of common HTTP
routines.

#### Redirects

There is a handler for redirection:

{% highlight scala %}

  get("/"){
    redirect("/someplace/else")
  }

{% endhighlight %}

This will return a redirect response, with HTTP status 302, pointing to
`/someplace/else`.

_Caution:_ `redirect` is implemented as a HaltException.  You probably don't
want to catch it in an action.

Although there's no built-in handler for permanent redirects, if you'd like to
do a 301 permanent redirect, you can do something like this:

{% highlight scala %}
halt(status = 301, headers = Map("Location" -> "http://example.org/"))
{% endhighlight %}

#### Halting

To immediately stop a request within a filter or route:

{% highlight scala %}

halt()
{% endhighlight %}

You can also specify the [HTTP status][statuses]:

[statuses]: http://en.wikipedia.org/wiki/List_of_HTTP_status_codes

{% highlight scala %}

halt(403)
{% endhighlight %}

Or the status and the body:

{% highlight scala %}

halt(403, <h1>Go away!</h1>)
{% endhighlight %}

Or even the HTTP status reason and headers.  For more complex invocations, it
is recommended to use named arguments:

{% highlight scala %}

  halt(status = 403,
       reason = "Forbidden",
       headers = Map("X-Your-Mother-Was-A" -> "hamster",
                     "X-And-Your-Father-Smelt-Of" -> "Elderberries"),
       body = <h1>Go away or I shall taunt you a second time!</h1>)

{% endhighlight %}

The `reason` argument is ignored unless `status` is not null.  If you don't pass
arguments for `status`, `reason`, or `body`, those parts of the response will
be left unchanged.

_Caution:_ `halt` is implemented as a HaltException.  You probably don't want
to catch it in an action.

#### Passing

A route can punt processing to the next matching route using `pass()`.  Remember,
unlike Sinatra, routes are matched from the bottom up.

{% highlight scala %}

  get("/guess/*") {
    "You missed!"
  }

  get("/guess/:who") {
    params("who") match {
      case "Frank" => "You got me!"
      case _ => pass()
    }
  }

{% endhighlight %}

The route block is immediately exited and control continues with the next
matching route.  If no matching route is found, the `notFound` handler is
invoked.

#### notFound

The `notFound` handler allows you to execute code when there is no matching
route for the current request's URL.

The default behavior is:

{% highlight scala %}

  notFound {
    <h1>Not found. Bummer.</h1>
  }

{% endhighlight %}

What happens next differs slightly based on whether you've set your application
up using ScalatraServlet or ScalatraFilter.

* _ScalatraServlet_: sends a 404 response
* _ScalatraFilter_: passes the request to the servlet filter chain, which may
  then throw a 404 or decide to do something different with it.
