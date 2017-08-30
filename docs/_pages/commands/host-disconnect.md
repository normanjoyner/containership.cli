---
command-name: 'host disconnect'
permalink: '/docs/commands/host-disconnect'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to shutdown the containership process on a given host.

> Note, this does NOT remove the VM, it will only stop the containership agent process running on the machine.

~~~
csctl host disconnect 0130a049-4d15-46fc-96a5-85e1cb29212c

Successfully disconnected the host!
~~~
