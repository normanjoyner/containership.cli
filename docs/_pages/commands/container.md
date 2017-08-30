---
command-name: 'container'
permalink: '/docs/commands/container'
---

<h2> Overview </h2>

The `{{ page.command-name }}` command is responsible for listing, showing, and manipulating containers on your cluster. See the sub-commands below for more information.

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
