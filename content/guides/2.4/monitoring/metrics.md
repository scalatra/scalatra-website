---
aliases:
  - /2.4/guides/monitoring/metrics.html
layout: oldguide
title: Metrics
---

<div class="alert alert-info">
  <img src="/images/glyphicons/glyphicons_023_cogwheels.png">This functionality is available starting in Scalatra 2.4.
</div>

Scalatra supports metrics via the [metrics](https://dropwizard.github.io/metrics/3.1.0/) and
[metrics-scala](https://github.com/erikvanoosten/metrics-scala) projects.

### Setup

In order to make use of this functionality, add `scalatra-metrics` to your `build.sbt`:

```scala
"org.scalatra" %% "scalatra-metrics" % "{{< 2-4-scalatra_version >}}"
```

and mix in the MetricsBootstrap trait into ScalatraBootstrap:

```scala
class ScalatraBootstrap extends LifeCycle with MetricsBootstrap {
  override def init(context: ServletContext) =
  {
    // ...
  }
}
```

Mixing in MetricsBootstrap will provide a default instance of both a MetricRegistry and a HealthCheckRegistry to your application. You can also choose to override one or both if the defaults don't suit your purpose.

```scala
class ScalatraBootstrap extends LifeCycle with MetricsBootstrap {
  override val metricRegistry = ???
  override val healthCheckRegistry = ???
  override def init(context: ServletContext) =
  {
  }
}
```

### Metrics Servlets

Convenience methods are provided to mount the metrics servlets at a specified path from the init method.

```scala
class ScalatraBootstrap extends LifeCycle with MetricsBootstrap {
  override def init(context: ServletContext) =
  {
    context.mountMetricsAdminServlet("/metrics-admin")
    context.mountHealthCheckServlet("/health")
    context.mountMetricsServlet("/metrics")
    context.mountThreadDumpServlet("/thread-dump")
    context.installInstrumentedFilter("/test/*")
  }
}
```

Details for what each servlet does are provided in the
[Metrics Servlets Documentation](https://dropwizard.github.io/metrics/3.1.0/manual/servlets/)

### Metrics Filter

A convenience method is also provided to mount a servlet filter to aggregate response code counts and timings. The parameter passed will specify where to apply the filter. To apply it globally, use ```/*```

```scala
class ScalatraBootstrap extends LifeCycle with MetricsBootstrap {
  override def init(context: ServletContext) =
  {
    context.installInstrumentedFilter("/test/*")
  }
}
```

<div class="alert alert-error">
  In its current state, this filter does not handle AsyncContext correctly and will be inaccurate if you are using Futures.
</div>

### Measuring

In order to record metrics in your servlets, mix in the ```MetricsSupport``` trait and call the provided methods:

```scala
class TestServlet extends ScalatraServlet with MetricsSupport {
  get("/") {
    timer("timer") {
      // Code that's timed by a timer named "timer"
    }

    // Increments a counter called "counter"
    counter("counter") += 1

    // Increments a histogram called "histogram"
    histogram("histogram") += 1

    // Sets a gauge called "gauge"
    gauge("gauge") {
      "gauge"
    }

    // Sets a meter named "meter"
    meter("meter").mark(1)
  }
}
```

### Health Checks

In order to make use of health checks, mix in the ```HealthChecksSupport``` trait and define your health
checks:

```scala
class TestServlet extends ScalatraServlet with HealthChecksSupport {
  get("/") {
    healthCheck("basic") {
      true
    }

    healthCheck("withMessage", unhealthyMessage = "DEADBEEF") {
      true
    }
  }
}
```

### Advanced

In addition to the provided convenience methods, the full `metrics-core`, `metrics-servlet`, `metrics-servlets`, and `metrics-scala` libraries are available for import. The default registries are exposed as `implicit val`s, and so can be accessed directly if needed.
