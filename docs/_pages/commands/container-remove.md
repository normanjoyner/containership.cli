---
command-name: 'container remove'
permalink: '/docs/commands/container-remove'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to remove a container from an application.
</p>

> Note: this is only applicable to the `containership` orchestrator. If you are running a `k8s`
cluster, this command is not supported. You can use `app scale-down` to remove containers.

~~~
csctl container remove <container_id>

Succesfully removed container!
~~~
