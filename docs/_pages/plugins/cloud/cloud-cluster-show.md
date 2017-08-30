---
command-name: 'cloud cluster show'
permalink: '/docs/plugins/cloud/cloud-cluster-show'
---

<h2> {{ page.command-name }} </h2>

The `{{ page.command-name }}` command allows you to view a details about the given containership cloud cluster

> You must be viewing a cluster under your currently active organization.
See [cloud org use]({{ site.baseurl }}/docs/plugins/cloud/cloud-org-use)
for more information about setting an active organization for the client.

~~~
csctl cloud cluster show <cluster_id>

┌────────────────┬──────────────────────────────────────┐
│ ID             │ 0a1f3a9f-4c48-4882-9fdc-4dd2ac5a6bbc │
├────────────────┼──────────────────────────────────────┤
│ NAME           │ SampleCluster                        │
├────────────────┼──────────────────────────────────────┤
│ ENVIRONMENT    │ dev                                  │
├────────────────┼──────────────────────────────────────┤
│ CREATED_AT     │ 2017-08-29T13:21:07.813Z             │
├────────────────┼──────────────────────────────────────┤
│ CLOUD_PROVIDER │ Digital Ocean                        │
├────────────────┼──────────────────────────────────────┤
│ PUBLIC_IP      │ 255.255.255.188                      │
├────────────────┼──────────────────────────────────────┤
│ PORT           │ 80                                   │
├────────────────┼──────────────────────────────────────┤
│ LOCKED         │ false                                │
├────────────────┼──────────────────────────────────────┤
│ LEADER_COUNT   │ 1                                    │
├────────────────┼──────────────────────────────────────┤
│ FOLLOWER_COUNT │ 1                                    │
├────────────────┼──────────────────────────────────────┤
│ APP_COUNT      │ 5                                    │
├────────────────┼──────────────────────────────────────┤
│ TOTAL CPUS     │ 2.00                                 │
├────────────────┼──────────────────────────────────────┤
│ TOTAL MEMORY   │ 1901 MB                              │
└────────────────┴──────────────────────────────────────┘
~~~
