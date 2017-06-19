---
command-name: 'app delete'
permalink: '/docs/commands/app-delete'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to remove an application from your cluster.
</p>

> If this is a Containership cloud cluster, it must not be `locked`

~~~
csctl app delete sampleredis

Successfully deleted application sampleredis!
~~~
