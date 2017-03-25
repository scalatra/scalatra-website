---
aliases:
  - /2.3/guides/resources/coffeescript.html
title: CoffeeScript
---

[CoffeeScript](http://coffeescript.org/) is a seriously awesome client-side scripting
language that fixes the many warts of Javascript.


<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}resources/scalatra-coffeescript">scalatra-coffeescript</a>
  for a minimal and standalone project containing the example in this guide.
</div>

---

## Full usage guide
Because CoffeeScript is an external project, we won't attempt to reproduce its
documentation here.
Go to the [official documentation](http://coffeescript.org/); you'll be glad you did!

## Set up CoffeeScript in Scalatra

### Install

Install the plugin by adding the dependency to your `project/plugins.sbt`:

```scala
resolvers += Resolver.url("sbt-plugin-snapshots",
  new URL("http://scalasbt.artifactoryonline.com/scalasbt/sbt-plugin-snapshots/"))(
    Resolver.ivyStylePatterns)

addSbtPlugin("com.bowlingx" %% "xsbt-wro4j-plugin" % "0.1.0-SNAPSHOT")
```

### Enable

Add these imports to the very **top** of your `build.sbt`:

```scala
import com.bowlingx.sbt.plugins.Wro4jPlugin._
import Wro4jKeys._
```

Now enable to plugin by adding these lines to your `build.sbt`, after all your imports.
Don't attempt to remove the blank line!

```scala
seq(wro4jSettings: _*)

(webappResources in Compile) <+= (targetFolder in generateResources in Compile)
```

### Configure
Unfortunately, the plugin we're using does require a bit of configuration.

Create the file `src/main/webapp/WEB-INF/wro.xml`, telling the compiler where our
CoffeeScript files are:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<groups
    xmlns="http://www.isdc.ro/wro"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.isdc.ro/wro wro.xsd"
    >

  <group name="scripts">
    <js>/coffee/*.coffee</js>
  </group>
</groups>
```

Also create the file `src/main/webapp/WEB-INF/wro.properties`, requesting CoffeeScript
compilation:


```
preProcessors = coffeeScript
postProcessors =
```

## Example

With installation out of the way, you're free to put your CoffeeScript files in
`src/main/webapp/coffee`.
It doesn't matter what the file/s are called, so long as they have the `.coffee`
extension we said we'd use in the `wro.xml` configuration.

For example, create `src/main/webapp/less/main.coffee`, which shows off the
optionality of parentheses and semicolons in CoffeeScript:


```coffeescript
alert "Hello CoffeeScript!"
```

That file will be compiled to one called `compiled/scripts.js`, so you can refer to it
in your app like this:

```scala
class CoffeeScriptApp extends ScalatraServlet {

  get("/") {
    <html>
      <body>
        <h1>This is
          <a href="http://scalatra.org/2.2/guides/resources/coffeescript.html">resources/coffeescript</a>!
        </h1>

        <script type="text/javascript" src="compiled/scripts.js"></script>
      </body>
    </html>
  }
}
```


## See it in action
Now compile and run your app as usual. If all has gone well, and you've used the
above example, an annoying popup should launch on page load.

```sh
$ cd scalatra-coffeescript
$ ./sbt
> container:start
> browse
```

If `browse` doesn't launch your browser, manually open
[http://localhost:8080/](http://localhost:8080/) in your browser.

## Further documentation
The resources processor we've been using, wro4j, is extensively configurable.
See the [wro4j documentation](http://code.google.com/p/wro4j/) for more information.
