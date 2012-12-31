---
layout: guide
title: IDE Support | Scalatra
---

<div class="page-header">
  <h1>IDE Support (optional)</h1>
</div>

Because Scalatra is a pure-Scala no-magic framework, Scala IDEs such as
[Eclipse](http://scala-ide.org/),
[IntelliJ](http://confluence.jetbrains.net/display/SCA/Scala+Plugin+for+IntelliJ+IDEA),
and [ENSIME](https://github.com/aemoncannon/ensime) (for Emacs)
"understand" Scalatra and can assist your development.
This is totally optional, so if you don't like IDEs, feel free to skip this section.

---

## Eclipse (*aka* Scala IDE)
- Download [Eclipse Classic](http://www.eclipse.org/downloads/packages/eclipse-classic-421/junosr1) and then add the [Scala plugin](http://scala-ide.org/).
- Now install the [sbt-eclipse](https://github.com/typesafehub/sbteclipse) plugin by
adding this line to your `project/plugins.sbt` file:

```scala
addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "2.1.1")
```

This sbt plugin generates Eclipse classpath and configuration files to ensure the
project will work as expected in the IDE.

```
$ ./sbt
> eclipse
```

Be sure to re-run `./sbt eclipse` every time you add or update a dependency in
`build.sbt`.

## IntelliJ IDEA

- Download [IntelliJ IDEA](http://www.jetbrains.com/idea/download/index.html).
The community edition is fine.
- Install the [Scala plugin](http://confluence.jetbrains.net/display/SCA/Scala+Plugin+for+IntelliJ+IDEA) from JetBrains.
- Now install the [sbt-idea](https://github.com/mpeltonen/sbt-idea) plugin by adding
this line to your `project/plugins.sbt` file:

```scala
addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.2.0")
```

This sbt plugin generates IntelliJ classpath and configuration files to ensure the
project will work as expected in the IDE.

```
$ ./sbt
> idea
```

Be sure to re-run `./sbt idea` every time you add or update a dependency in
`build.sbt`.

## ENSIME (for Emacs)

Users of the one true editor, rejoice! There is excellent support for Scala in Emacs.

- We recommend you install [scala-mode2](https://github.com/hvesalai/scala-mode2) for your basic formatting and syntax highlighting.
- [ENSIME](https://github.com/aemoncannon/ensime) lives on top of your Scala major mode,
adding features like refactoring and error highlighting.
- To integrate ENSIME with your Scalatra project, use the
[ensime-sbt-cmd](https://github.com/aemoncannon/ensime-sbt-cmd) plugin.
Add this line to your `build.sbt` file:

```scala
addSbtPlugin("org.ensime" % "ensime-sbt-cmd" % "0.1.0")
```

Now from sbt you can run:

```
$ ./sbt
> ensime-generate
```

That will generate a classpath file that will tell ENSIME where to look for your
class files and their dependencies.



