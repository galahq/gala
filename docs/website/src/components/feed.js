import React from "react";

export default function Feed() {
  const recentPosts = require("../../.docusaurus/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json");

  return (
    <ul>
      {recentPosts.items.slice(0, 6).map((item, index) => (
        <li key={index}>
          <a href={`${item.permalink}`}>{item.title}</a>{" "}
        </li>
      ))}
    </ul>
  );
}
