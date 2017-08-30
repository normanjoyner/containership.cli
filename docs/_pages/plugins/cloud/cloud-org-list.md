---
command-name: 'cloud org list'
permalink: '/docs/plugins/cloud/cloud-org-list'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to view a list of all the organizations you have access to.

~~~
csctl cloud org list

┌──────────────────────────────────────┬───────────────────────────┐
│ ID                                   │ ORGANIZATION              │
├──────────────────────────────────────┼───────────────────────────┤
│ 00000000-0000-0000-0000-000000000000 │ sample-org                │
└──────────────────────────────────────┴───────────────────────────┘
~~~

> Note: the currently active organization for the client is denoted by the `*` symbol next to the name
