---
command-name: 'host list'
permalink: '/docs/commands/host-list'
---

<h2> {{ page.command-name }} </h2>

<p>
The {{ page.command-name }} allows you to view a list of all the hosts running on your cluster with
some basic metadata about each host displayed.
</p>

~~~
csctl host list

┌──────────────────────────────────────┬─────────────────────────────────────────┬───────────┬────────────┐
│ ID                                   │ START_TIME                              │ MODE      │ CONTAINERS │
├──────────────────────────────────────┼─────────────────────────────────────────┼───────────┼────────────┤
│ 0130a049-4d15-46fc-96a5-85e1cb29212c │ Thu Aug 24 2017 12:51:28 GMT-0400 (EDT) │ follower  │ 4          │
├──────────────────────────────────────┼─────────────────────────────────────────┼───────────┼────────────┤
│ 476dda9a-3f7e-47ba-807e-7de9b21f024a │ Thu Aug 24 2017 12:50:48 GMT-0400 (EDT) │ leader *  │ 0          │
└──────────────────────────────────────┴─────────────────────────────────────────┴───────────┴────────────┘
~~~

> The `controlling leader` is designated with an `*` after the mode type.
