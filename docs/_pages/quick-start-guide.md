---
permalink: '/docs/quick-start-guide/'
---
---

# Quick Start Guide

First install the command line client by following one of the installation methods
[described here]({{ site.baseurl }}/docs/installation)

You can view all the commands by browsing the documentation and the CLI itself provides
a help manual to describe the various commands and arguments:
`csctl --help`

~~~
Commands:
  svc            List and manipulate services running on the cluster
                 specified by the client remote.
  client-plugin  List and manipulate plugins for Containership client.
  container      List and manipulate containers running on the configured
                 containership cluster.
  host           List and manipulate hosts running on the configured
                 containership cluster.
  info           Show info about current active cluster.
  remote         Commands for manipulating remotes pointing to Containership
                 clusters.
~~~

The first step is to connect your client to an existing Containership cluster with a remote by giving
it a name and the URL to a `leader` node:

> Note: `remote_name` is just a local name for you to reference this remote.

`csctl remote add <remote_name> <remote_url>`

> This cluster will also need firewall rules for the Containership API open to the machine you are using the CLI from.
See <https://docs.containership.io/access-control/firewalls/oss-firewall-guidelines> for more informatino on firewalls.

> If it is a cluster created through the Containership Cloud dashboard, the `cloud` plugin can assist you in setting up remotes.

After you have created the remote, you can set it as your currently active remote with the following command:

`csctl remote set-active <remote_name>`

At this point you should have a properly configured remote pointing to one of your Containership clusters. You can then
use the other various commands to interact and view your cluster:

`csctl svc list`

## Containership Cloud

The above version works for both open-source clusters and those connected to the Containership Cloud dashboard. If you are trying
to configure the CLI to a cluster created with a Containership Cloud account, the [cloud plugin]({{ site.baseurl }}/docs/plugins/cloud/overview)
provides an easy way to interface with your organizations and clusters.

First, ensure that the `cloud` plugin is installed for the command line client:

`csctl client-plugin add containership.plugin.cloud`

You can ensure it was successfully installed by running:

~~~
csctl client-plugin list

┌────────────────────────────┬─────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ NAME                       │ VERSION │ DESCRIPTION                                      │ PATH                                             │
├────────────────────────────┼─────────┼──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
│ containership.plugin.cloud │ 0.14.0  │ Containership cloud management client.           │ /Users/root/.containership/plugins/containership │
│                            │         │                                                  │ .plugin.cloud                                    │
└────────────────────────────┴─────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
~~~

Once installed, you should see an additional top-level command line client command called `cloud`:

~~~
csctl --help

Commands:
  client-plugin  List and manipulate plugins for Containership client.
  container      List and manipulate containers running on the configured
                 containership cluster.
  host           List and manipulate hosts running on the configured
                 containership cluster.
  info           Show info about current active cluster.
  remote         Commands for manipulating remotes pointing to Containership
                 clusters.
  svc            List and manipulate services running on the cluster specified
                 by the client remote.
  cloud          Containership cloud management client.
~~~

You can then login to your Containership Cloud account via:

`csctl cloud account login`

> You can generate an access token for the CLI at <http://docs.containership.io/access-control#personal-access-tokens>

From there you can list all the organizations you belong to with:

~~~
csctl cloud org list

┌──────────────────────────────────────┬───────────────────────────┐
│ ID                                   │ ORGANIZATION              │
├──────────────────────────────────────┼───────────────────────────┤
│ 00000000-0000-0000-0000-000000000000 │ sample-org                │
└──────────────────────────────────────┴───────────────────────────┘
~~~

Then, copy the ID and run the command:

`csctl cloud org use <org_id>`

Once you have an active organization, you can list all the clusters available underneath that organization:

~~~
csctl cloud cluster list

┌──────────────────────────────────────┬───────────────────────────┬─────────────┬────────────────┬────────────┬───────────┐
│ ID                                   │ NAME                      │ ENVIRONMENT │ CLOUD_PROVIDER │ HOST_COUNT │ APP_COUNT │
├──────────────────────────────────────┼───────────────────────────┼─────────────┼────────────────┼────────────┼───────────┤
│ 00000000-0000-0000-0000-000000000000 │ sample-cluster            │ dev         │ Digital Ocean  │ 2          │ 4         │
└──────────────────────────────────────┴───────────────────────────┴─────────────┴────────────────┴────────────┴───────────┘
~~~

Similar to the `org use` command, you can set the active cluster with:

`csctl cloud cluster use <cluster_id>`

Once set, it will have automatically created a `remote` for you authenticated with your Containership Cloud account.

~~~
csctl remote list

┌────────────────────────────────────────┬─────────┬────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAME                                   │ VERSION │ URL                                                                                                │
├────────────────────────────────────────┼─────────┼────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ * 00000000-0000-0000-0000-000000000000 │ v1      │ https://api.containership.io/v2/organizations/00000000-0000-0000-0000-000000000000/clusters/       │
│                                        │         │ 00000000-0000-0000-0000-000000000000/proxy                                                         │
└────────────────────────────────────────┴─────────┴────────────────────────────────────────────────────────────────────────────────────────────────────┘
~~~

You can then interact with the cluster using the standard commands such as `svc`, `host`, etc.
