---
command-name: 'svc delete'
permalink: '/docs/commands/svc-delete'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to remove an service from your cluster.
</p>

> If this is a Containership cloud cluster, it must not be `locked`

~~~
csctl svc delete sampleredis

Successfully deleted service sampleredis!
~~~
