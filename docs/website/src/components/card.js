import React from "react";
import card from "./card.module.css";

export default function Card({
  content: { hed, dek, image, body, moreLink, caseLink }
}) {
  const isCaseURLString = "learngala.com/cases";
  return (
    <div className="card">
      <div className="card__image">
        {image && image.length > 0 && (
          <img src={require("./assets/" + image).default}></img>
        )}
      </div>
      <div className="card__header">
        <h4>
          <span className={card.hed}>{hed}</span>
          <br />
          <span className={card.dek}>{dek}</span>
        </h4>
      </div>
      <div className={"card__body"}>{body}</div>
      <div className="card__footer">
        <div className={"button-group button-group--block"}>
          {caseLink && caseLink.length > 0 && (
            <a
              href={caseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--secondary button--block"
            >
              {caseLink.includes(isCaseURLString)
                ? "See the case"
                : "See case library"}
            </a>
          )}
          {moreLink && moreLink.length > 0 && (
            <a
              href={moreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--secondary button--block"
            >
              Learn More
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
