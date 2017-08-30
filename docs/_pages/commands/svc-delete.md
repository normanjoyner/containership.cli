---
command-name: 'svc delete'
permalink: '/docs/commands/svc-delete'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to remove a service from your cluster.

> If this is a Containership Cloud cluster, it must not be `locked`

~~~
csctl svc delete sampleredis

Successfully deleted service sampleredis!
~~~
