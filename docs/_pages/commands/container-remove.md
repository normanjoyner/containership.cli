---
command-name: 'container remove'
permalink: '/docs/commands/container-remove'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to remove a container from a service.
</p>

> Note: this is only services to the `containership` orchestrator. If you are running a `k8s`
cluster, this command is not supported. You can use `svc scale-down` to remove containers.

~~~
csctl container remove <container_id>

Successfully removed container!
~~~
