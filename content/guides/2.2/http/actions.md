---
aliases:
  - /2.2/guides/http/actions.html
title: Actions
---

As explained in the [routes guide](routes.html), an action is the code that handles
a route.

When an incoming request matches a route, that route's action is executed.

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  The
  <a href="{{site.examples}}http/scalatra-http-demo">scalatra-http-demo</a>
  is a good place to start if you need to see basic requests and response, cookies,
  and dealing with form input.
</div>

## Default behavior

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

## Custom action behavior

The behavior for the types in the above chart, or for types not in the chart at all,
may be customized for these or other return types by overriding `renderResponse`.

<span class="badge badge-info"> <i class="icon-bookmark icon-white"></i>ActionResult example</span>

```scala
get("/file/:id") {
  fileService.find(params("id")) match {
    case Some(file) => Ok(file)
    case None       => NotFound("Sorry, the file could not be found")
   }
 }
```

In this example, ActionResult is being used conditionally to give back different
response codes based on what's happened in the action. If a `file` is found
by the hypothetical `fileService`, the action returns `Ok(file)`. This means
that the response was successful, and there's a response code of 200.

If the `fileService` didn't find a file, the action returns `NotFound` and
a message. The `NotFound` sets a response code of 404.

There are several dozen possible responses in Scalatra, if you want to see
all of them and find out what response codes they produce, the easiest way is
to look at the [ActionResult source code][actionresult-source].


[actionresult-source]:https://github.com/scalatra/scalatra/blob/develop/core/src/main/scala/org/scalatra/ActionResult.scala
