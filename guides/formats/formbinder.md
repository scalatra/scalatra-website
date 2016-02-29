---
layout: guide
title: Form Binder | Formats | Scalatra guides
---

<div class="page-header">
  <h1>Form Binder</h1>
</div>


Form-binder is a micro data binding and validating framework, easy to use and hack.

## Usage at a glance

```scala
import com.github.tminglei.bind.simple._

val binder = FormBinder(messages, errsTree())

val mappings = tmapping(
  "id" -> long(),
  "body" -> (expandJson() >-: tmapping(
    "email" -> (required() >+: text(email())),
	  "price" -> (omitLeft("$") >-: float()),
	  "count" -> number().verifying(min(3), max(10))
  ).label("xx").verifying { case (label, (email, price, count), messages) =>
	  if (price * count > 1000) {
	    Seq(s"$label: $price * $count = ${price * count}, too much!")
	  } else Nil
  })
)

binder.bind(mappings, params).fold(
  errors => errors,
  { case (id, (email, price, count)) => 
    // do something here
  }
)

```

1) define your binder
2) define your mappings
3) prepare your data
4) bind and consume


## Installation & Integration

#### 1. Add the dependency to your sbt project file:

```scala
libraryDependencies += "com.github.tminglei" %% "form-binder" % "0.10.0"
```

#### 2. Define your helper trait:

```scala
object FormBinderSupport {
  val BindMessagesKey = "__bind_messages"
}

trait FormBinderSupport extends I18nSupport { self: ScalatraBase =>
  import FormBinderSupport._

  before() {
    request(BindMessagesKey) = Messages(locale, bundlePath = "bind-messages")
  }

  def binder(implicit request: HttpServletRequest) = FormBinder(bindMessages.get, errsTree())

  ///
  private def bindMessages(implicit request: HttpServletRequest): Messages = if (request == null) {
    throw new ScalatraException("There needs to be a request in scope to call bindMessages")
  } else {
    request.get(BindMessagesKey).map(_.asInstanceOf[Messages]).orNull
  }
}
```

#### 3. Then, mix and use it in your app codes:

```scala
import org.scalatra.ScalatraServlet
import com.github.tminglei.bind.simple._

class SampleServlet extends ScalatraServlet with FormBinderSupport {

  get("/:id") {
    val mappings = tmapping(
      "id" -> long()
    )
    binder.bind(mappings, data(multiParams)).fold(
      errors => holt(400, errors),
      { case (id) =>
        Ok(toJson(repos.features.get(id)))
      }
    )
  }
}
```

That's it. _See the [project site](https://github.com/tminglei/form-binder) for more details._
