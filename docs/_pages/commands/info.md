---
command-name: 'info'
permalink: '/docs/commands/info'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to view high level information about your cluster.

~~~
csctl info

┌─────────────────────────────┬──────────────────────────────────────┐
│ CPUS (USED / TOTAL)         │ 0.50 / 2.00                          │
├─────────────────────────────┼──────────────────────────────────────┤
│ MEMORY (USED / TOTAL)       │ 544 MB / 1901 MB                     │
├─────────────────────────────┼──────────────────────────────────────┤
│ SERVICES                    │ containership-logs                   │
│                             │ containership-prometheus             │
│                             │ containership-prometheus-agents      │
│                             │ ntpd                                 │
│                             │ service-discovery                    │
├─────────────────────────────┼──────────────────────────────────────┤
│ CONTAINERS (LOADED / TOTAL) │ 5 / 5                                │
├─────────────────────────────┼──────────────────────────────────────┤
│ HOSTS                       │ ba1286c4-5750-4064-9db8-1462ad815584 │
│                             │ 6b277cce-7038-4238-8ead-196ccab38742 │
└─────────────────────────────┴──────────────────────────────────────┘
~~~
