---
aliases:
  - /2.3/guides/resources/less-css.html
title: LESS CSS
---

[LESS](http://lesscss.org/) is an extension to CSS that adds DRY features such as
variables, mixins, operations, and functions.
If you've felt the agony of repetitious CSS code (read: if you've written CSS), it's
time to start using LESS.
Fortunately it's easy to add LESS to your build chain, causing sbt to translate your
LESS into CSS during normal compilation.
Best of all, since CSS is a valid subset of LESS, you can add the new features
when you have time to learn them, on your schedule!

<div class="alert alert-info">
  <span class="badge badge-info"><i class="icon-flag icon-white"></i></span>
  See
  <a href="{{site.examples}}resources/scalatra-less-css">scalatra-less-css</a>
  for a minimal and standalone project containing the example in this guide.
</div>

----

## Full usage guide
Because LESS is an external project, we won't attempt to reproduce its documentation
here.
Go to the [official documentation](http://lesscss.org/) and learn you some LESS!

## Set up LESS in Scalatra

### Install

Install the plugin by adding the dependency to your `project/plugins.sbt`:

```scala
resolvers += Resolver.url("sbt-plugin-snapshots",
  new URL("http://scalasbt.artifactoryonline.com/scalasbt/sbt-plugin-snapshots/"))(
    Resolver.ivyStylePatterns)

addSbtPlugin("com.bowlingx" %% "xsbt-wro4j-plugin" % "0.3.5")
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
LESS files are:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<groups
    xmlns="http://www.isdc.ro/wro"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.isdc.ro/wro wro.xsd"
    >

  <group name="styles">
    <css>/less/*.less</css>
  </group>
</groups>
```

Also create the file `src/main/webapp/WEB-INF/wro.properties`, requesting LESS
compilation:

```
preProcessors = lessCss
postProcessors =
```

## Example
With installation out of the way, you're free to put your LESS files in
`src/main/webapp/less`.
It doesn't matter what the file/s are called, so long as they have the `.less`
extension we said we'd use in the `wro.xml` configuration.

For example, create `src/main/webapp/less/main.less`, which shows off the use of
variables in LESS:

```css
@base: #f938ab;

body {
    color: @base
}
```

That file will be compiled to one called `compiled/styles.css`, so you can refer to it
in your app like this:

```scala
class LessCssApp extends ScalatraServlet {

  get("/") {
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="compiled/styles.css" />
      </head>
      <body>
        <h1>This is <a href="http://scalatra.org/2.2/guides/resources/less-css.html">resources/less-css</a>!</h1>
      </body>
    </html>
  }
}
```

## See it in action
Now compile and run your app as usual. If all has gone well, and you've used the
above example, your text should be pink:

```sh
$ cd scalatra-less-css
$ ./sbt
> container:start
> browse
```

If `browse` doesn't launch your browser, manually open [http://localhost:8080/](http://localhost:8080/) in your browser.

## Further documentation
The resources processor we've been using, wro4j, is extensively configurable.
See the [wro4j documentation](http://code.google.com/p/wro4j/) for more information.
