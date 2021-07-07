import React from "react";
import Layout from "@theme/Layout";
import Wrapper from "../components/pageWrapper";

export default function HelpPage() {
  return (
    <Layout>
      <Wrapper>
        <h1>Help</h1>
        <div>
          Gala is developed and maintained by a very small team in the
          University of Michigan’s School of Environment and Sustainability. We
          hope this website will have the answers to your questions. If not,
          please email us at <em>hello@learngala.com</em>. We’ll be happy to
          hear from you and we’ll do our best to help.
        </div>
      </Wrapper>
    </Layout>
  );
}
