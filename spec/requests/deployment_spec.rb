# frozen_string_literal: true

require 'rails_helper'

RSpec.describe "/deployments", type: :request do
  it "destroys a deployment" do
    @deployment = create(:deployment, :with_quiz)
    expect{delete deployment_url(@deployment)}.to change{Deployment.count}.by(-1)
  end
end
