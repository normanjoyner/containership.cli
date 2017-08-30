---
command-name: 'client-plugin search'
permalink: '/docs/commands/client-plugin-search'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to search for official containership plugins from the metadata registry.

~~~
csctl client-plugin search

┌───────────────────┬────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAME              │ SOURCE                                 │ DESCRIPTION                                                                                        │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ navigator         │ containership.plugin.navigator         │ A web-ui for managing your Containership cluster                                                   │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ service-discovery │ containership.plugin.service-discovery │ A service discovery plugin for Containership                                                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ cloud             │ containership.plugin.cloud             │ Official Containership plugin for managing clusters with Containership Cloud                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ cloud-hints       │ containership.plugin.cloud-hints       │ A Containership plugin used to automatically set cloud metadata in the form of host tags           │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ metrics           │ containership.plugin.metrics           │ Containership metrics plugin                                                                       │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ standalone        │ containership.plugin.standalone        │ Official Containership plugin for launching a local Containership cluster                          │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ tide              │ containership.plugin.tide              │ A cron-like job scheduler for Containership                                                        │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ logs              │ containership.plugin.logs              │ Official logging plugin for Containership                                                          │
├───────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ntp               │ containership.plugin.ntp               │ Official NTP plugin for Containership                                                              │
└───────────────────┴────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘
~~~
