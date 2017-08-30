---
command-name: 'cloud cluster list'
permalink: '/docs/plugins/cloud/cloud-cluster-list'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to view a list of all the clusters you have access to underneath
the currently `active_organization`.

> See [cloud org use]({{ site.baseurl }}/docs/plugins/cloud/cloud-org-use)
for more information about setting an active organization for the client.

~~~
csctl cloud cluster list

┌──────────────────────────────────────┬───────────────────────────┐
│ ID                                   │ ORGANIZATION              │
├──────────────────────────────────────┼───────────────────────────┤
│ 00000000-0000-0000-0000-000000000000 │ sample-cluster            │
└──────────────────────────────────────┴───────────────────────────┘
~~~

> Note: the currently active cluster for the client is denoted by the `*` symbol next to the name
