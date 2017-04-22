---
title: IDE Support
---

Because Scalatra is a pure-Scala no-magic framework, Scala IDEs such as
[Eclipse](http://scala-ide.org/),
[IntelliJ](http://confluence.jetbrains.net/display/SCA/Scala+Plugin+for+IntelliJ+IDEA),
and [ENSIME](https://github.com/aemoncannon/ensime) (for Emacs)
"understand" Scalatra and can assist your development.

This is totally optional, so if you don't like IDEs, feel free to skip this section.

---

## IntelliJ IDEA

- Download [IntelliJ IDEA](http://www.jetbrains.com/idea/download/index.html). The community edition is fine.
- Install the [Scala plugin](http://confluence.jetbrains.net/display/SCA/Scala+Plugin+for+IntelliJ+IDEA) from JetBrains. You can do this most easily by clicking the "Browse repositories" button in the plugins manager. The plugin is called "Scala".
- Once the Scala plugin is installed, you can open any Scalatra project and get very good syntax highlighting and refactoring support.


### Debugging in IntelliJ Idea

Configure your container to listen for debuggers on port 5005 by adding the following lines to the `build.scala` file.

```
javaOptions ++= Seq(
  "-Xdebug",
  "-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
),
```

Start SBT and the container as usual (`./sbt` then `jetty:start`).

After that, go to `Run` -> `Edit configurations` in IntelliJ. Click the `+`
button, select `Remote` to make a new remote debugging configuration, and
call it `Scalatra Debug`. In IntelliJ 15, the default run conf should work
(it looks like this):

```
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005
```

Now just select `Run` -> `Debug 'Scalatra Debug'`. Setting breakpoints and
stepping through code should work.


## Eclipse (*aka* Scala IDE)
- Download [Eclipse Classic](http://www.eclipse.org/downloads/packages/eclipse-classic-421/junosr1) and then add the [Scala plugin](http://scala-ide.org/).
- Now install the [sbt-eclipse](https://github.com/typesafehub/sbteclipse) plugin by
adding this line to your `project/plugins.sbt` file:

```scala
addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "2.4.0")
```

This sbt plugin generates Eclipse classpath and configuration files to ensure the
project will work as expected in the IDE.

```
$ ./sbt
> eclipse
```
Be sure to re-run `./sbt eclipse` every time you add or update a dependency in
`project/build.scala`.

### Debugging in Eclipse

Configure your container to listen for debuggers on port 8000 by adding the following lines to the `build.scala` file.

```
javaOptions ++= Seq(
  "-Xdebug",
  "-Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8000"
),
```

Start SBT and the container as usual (`./sbt` then `jetty:start`).

Go to `Run` -> `Debug configurations` in Eclipse. Select
`Remote Java Application`, click the `new configuration`  button,
select `Remote` to make a new remote debugging configuration, and
call it `Scalatra Debug`.

Press the `Debug` button on the bottom right. Eclipse will attach itself to
SBT's remote debugger and your breakpoints will start working.



## ENSIME (for Emacs)

Users of the one true editor, rejoice! There is excellent support for Scala in Emacs.

- We recommend you install [scala-mode2](https://github.com/hvesalai/scala-mode2) for your basic formatting and syntax highlighting.
- [ENSIME](https://github.com/aemoncannon/ensime) lives on top of your Scala major mode,
adding features like refactoring and error highlighting.
- To integrate ENSIME with your Scalatra project, use the
[ensime-sbt-cmd](https://github.com/aemoncannon/ensime-sbt-cmd) plugin.
Add this line to your `project/build.scala` file:

```scala
addSbtPlugin("org.ensime" % "ensime-sbt-cmd" % "0.1.2")
```

Now from sbt you can run:

```
$ ./sbt
> ensime-generate
```

That will generate a classpath file that will tell ENSIME where to look for your
class files and their dependencies.
