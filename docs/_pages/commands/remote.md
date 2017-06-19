---
command-name: 'remote'
permalink: '/docs/commands/remote'
---

<h2> Overview </h2>

<p>
The {{ page.command-name }} is responsible for listing, showing, and manipulating `remotes` that reference containership clusters. The CLI uses these `remote configurations`
to manage CLI connections to and from clusters. See the sub-commands below for more information.
</p>

<h2> Commands </h2>

<p>
{% for item in site.data.navigation.docs %}
    {% if item.title == 'Commands' %}
        <ul>
        {% for link in item.children %}
            {% if link.title contains page.command-name and link.title != page.command-name %}
                <li><a href="{{site.baseurl}}{{link.url}}">{{link.title}}</a></li>
            {% endif %}
        {% endfor %}
        </ul>
    {% endif %}
{% endfor %}
</p>
