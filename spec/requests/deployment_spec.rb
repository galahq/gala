# frozen_string_literal: true

require 'rails_helper'

RSpec.describe "/deployments", type: :request do
  fit "destroys a deployment" do
    kase = create :case
    reader = create :reader, :editor
    create :enrollment, case: kase, reader: reader
    reader.my_cases << kase

    my_group = create :group, name: 'My Group'
    create :group_membership, :admin, group: my_group, reader: reader
    @deployment = create :deployment, :with_quiz, group: my_group, case: kase

    sign_in reader

    expect{delete deployment_url(@deployment)}.to change(Deployment, :count).by(-1)
  end
end
