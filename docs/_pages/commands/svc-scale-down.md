---
command-name: 'svc scale-down'
permalink: '/docs/commands/svc-scale-down'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to scale down an service running on your cluster.
</p>

|------+----+------------+----+----------|
| Argument | Alias | Description | Required | Default |
|-----------------|------|-----------|----------------|-------|
| count | c | Number of containers to scale service by | n | 1 |
|=================+============+=================+================+===|

~~~
csctl svc scale-down sampleredis --count=1

Successfully scaled down service sampleredis!
~~~
