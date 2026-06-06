<h2>Caching russian doll at the edge</h2>

Rails gave web developers a durable caching model. Cache the outer fragment. Reuse the inner fragments that did not change. The [Rails caching guide](https://guides.rubyonrails.org/caching_with_rails.html) calls this Russian doll caching.

The same idea now applies outside the template. The dolls can span the browser cache, CloudFront, the origin validator, the hot store, and the database. This builds on the scaling frame I used in [What it Means to Build Antifragile Cloud Architecture](https://spin.atomicobject.com/antifragile-cloud-architecture/). Stress exposes the next bottleneck. A good cache design moves that bottleneck outward.

<blockquote>
<a href="https://www.learngala.com">www.learngala.com</a>
</blockquote>

<strong><code>.com</code>>vs</strong><code>.dev</code></strong>

<blockquote>
<a href="https://learngala.dev">learngala.dev</a>
</blockquote>

This is old learnings, new experiment, I'm developing in public using OpenAI/Codex frontier models. Source is in public domain at the end of the post. You can run the speed test for yourself:


<svg role="img" aria-labelledby="cache-dolls-title cache-dolls-desc" viewBox="0 0 420 180" width="100%" xmlns="http://www.w3.org/2000/svg">
  <title id="cache-dolls-title">Simple nested cache dolls</title>
  <desc id="cache-dolls-desc">A simple line SVG showing nested cache layers labeled edge, 304, hot, and db.</desc>
  <rect x="12" y="150" width="396" height="10" rx="5" fill="currentColor" opacity="0.18"/>
  <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M86 24 C50 24 30 58 30 100 C30 142 54 160 86 160 C118 160 142 142 142 100 C142 58 122 24 86 24Z"/>
    <circle cx="86" cy="67" r="27"/>
    <path d="M64 112 L78 126 L64 140"/>
    <path d="M108 112 L94 126 L108 140"/>
    <path d="M198 40 C168 40 152 68 152 104 C152 140 172 156 198 156 C224 156 244 140 244 104 C244 68 228 40 198 40Z"/>
    <circle cx="198" cy="77" r="22"/>
    <path d="M180 120 L216 120"/>
    <path d="M296 60 C272 60 260 82 260 110 C260 140 276 154 296 154 C316 154 332 140 332 110 C332 82 320 60 296 60Z"/>
    <circle cx="296" cy="90" r="17"/>
    <path d="M284 122 L308 122"/>
    <path d="M366 82 C350 82 342 98 342 120 C342 144 352 154 366 154 C380 154 390 144 390 120 C390 98 382 82 366 82Z"/>
    <circle cx="366" cy="104" r="11"/>
    <path d="M359 129 L373 129"/>
  </g>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" fill="currentColor">
    <text x="86" y="174" text-anchor="middle">edge</text>
    <text x="198" y="174" text-anchor="middle">304</text>
    <text x="296" y="174" text-anchor="middle">hot</text>
    <text x="366" y="174" text-anchor="middle">db</text>
  </g>
</svg>

## Start with request shape

Most server-rendered apps have three route shapes. They should not share one cache policy. The response scope should decide the cache scope.

1. **Public shell.** Marketing pages, docs, catalogs, and public index pages.
2. **Tenant shell.** Pages that vary by host, locale, path, or a stable tenant key.
3. **User leaf.** Pages that vary by session, entitlement, or account state.

| Route shape | Good default | Edge stance | Risk |
| --- | --- | --- | --- |
| Public shell | `public, s-maxage=300` | Cache at CloudFront. | Stale copy after deploy. |
| Tenant shell | `public` only when safe. | Cache by host, path, locale, or tenant resource key. | Cache-key explosion. |
| User leaf | `private, no-cache` or `no-store`. | Keep it out of shared caches. | User data leakage. |

```text
request
  |
  v
+-----------------------------+
| Browser cache               |
| private data can live here  |
+-----------------------------+
  |
  | shared response only
  v
+-----------------------------+
| CloudFront edge             |
| outer doll                  |
| public shell                |
| tenant shell if key is safe |
+-----------------------------+
  |
  | miss or revalidate
  v
+-----------------------------+
| Rails origin                |
| ETag / Last-Modified        |
| 304 before rendering        |
+-----------------------------+
  |
  | render only if stale
  v
+-----------------------------+
| Hot store                   |
| fragments / JSON / IDs      |
+-----------------------------+
  |
  | last resort
  v
+-----------------------------+
| Database                    |
| innermost doll              |
+-----------------------------+
```

## Let HTTP reject stale work first

Do not start with Redis. Start with HTTP. Browsers already know how to ask whether a representation changed.

[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines `ETag` and `Last-Modified` as response validators. It also defines `If-None-Match` and `If-Modified-Since` as request preconditions. If the validator still matches, the server can return `304 Not Modified` with no response body.

```ruby
class CatalogsController < ApplicationController
  def show
    @items = Current.tenant.items.published.includes(:prices, :media)
    last_change = @items.maximum(:updated_at) || Current.tenant.updated_at

    expires_in 5.minutes,
      public: true,
      "s-maxage": 5.minutes,
      stale_while_revalidate: 30.seconds,
      stale_if_error: 5.minutes

    fresh_when(
      etag: [Current.tenant.cache_key_with_version, last_change],
      last_modified: last_change,
      public: true
    )
  end
end
```

This is boring by design. Rails gets to attach freshness to model state. The browser and edge get protocol-native headers. The app avoids rendering when the client already has the current answer.

## Name the cache policy precisely

[RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) makes the language clear. `no-cache` does not mean “never store this.” It means “do not reuse this without revalidation.” `no-store` means “do not store this.”

- Use `no-cache` when a stored response must revalidate before reuse.
- Use `no-store` when the response should not be stored at all.
- Use `public` only when a shared cache can safely reuse the response.
- Use `s-maxage` when shared caches should have their own freshness window.

## Cache the outer doll at the edge

CloudFront is not just an asset CDN. It can be the shared outer shell for safe HTML and API responses. That only works when the cache key stays small.

The [CloudFront cache-key docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-the-cache-key.html) describe how headers, cookies, and query strings shape reuse. Every extra dimension can multiply cache variants. The cache exists, but most requests still miss.

- Route broad shapes with [path-based cache behaviors](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesCacheBehavior.html).
- Vary only on dimensions that change the response.
- Avoid forwarding cookies for shared responses.
- Do not let `Set-Cookie` leak into public cached objects.
- Keep session-backed pages private or uncached.

## Use stale serving with care

`stale-while-revalidate` lets a cache serve an expired response while it refreshes in the background. `stale-if-error` lets a cache serve stale content when origin is unhealthy. CloudFront documents both in its [expiration and stale content guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html).

These are latency and resilience tools. They are not a reason to cache everything. The response still needs a safe cache key.

## Keep the hot store behind the protocol

A hot store is still useful. It should save expensive rendering and serialization. It should not hide a weak HTTP cache policy.

Prefer cache values that age well. Rendered strings, JSON blobs, IDs, counts, and small primitive payloads are safer than live ORM objects. The cache key should describe the same semantic version as the validator.

- Outer shell: CloudFront object.
- Origin contract: `ETag`, `Last-Modified`, and `Cache-Control`.
- Hot store: fragments or serialized data.
- Database: source of truth.

## This is not Rails-only

Rails gives this idea a good name. The same shape exists in Laravel, Django, Phoenix, and most server-rendered stacks. The nouns change. The protocol does not.

| Stack | Lever |
| --- | --- |
| Rails | [`fresh_when`](https://api.rubyonrails.org/classes/ActionController/ConditionalGet.html), `expires_in`, fragment caching. |
| Laravel | [`Cache::remember`](https://laravel.com/docs/cache), `Cache::flexible`, response headers. |
| Django | [per-view cache, template fragments, low-level cache API](https://docs.djangoproject.com/en/stable/topics/cache/). |
| Phoenix / Plug | [`Plug.Static`](https://hexdocs.pm/plug/Plug.Static.html), ETags, cache-control options. |

## Compress last

Brotli and Gzip help. They reduce bytes over the wire. They do not remove rendering, queries, or serialization.

Compression is the last doll. Conditional GET and shared-cache hits are bigger wins because they avoid sending the body in the first place.


## Conclusion

Russian doll caching still works. The dolls moved outward. The outer shell can be CloudFront. The middle shell can be an HTTP validator. The inner shell can be a hot store. The database should be the last stop.

The rule is simple. Cache the largest safe shell as far outward as possible. Revalidate before rendering. Keep personalized computation inside the smallest doll.

The fastest response is the one that stops before Rails renders. The cheapest compute is the render you never had to do.

</hr>
<p>
source:
<a href="https://github.com/galahq/gala/pull/785"><github.com/galahq/gala/pull/785/>
</p>