# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Forums index' do
  it 'lists the forums that the user can choose for the current case' do
    kase = create :case
    reader = create :reader
    create :enrollment, case: kase, reader: reader

    group = create :group, name: 'My Group'
    create :group_membership, group: group, reader: reader
    create :deployment, group: group, case: kase

    sign_in reader
    get "/cases/#{kase.slug}/forums.json"

    expect(response.body).to be_json including(
      including(community: including(name: 'My Group'))
    )
  end

  it 'indicates whether the reader can modify each forum' do
    kase = create :case
    reader = create :reader
    create :enrollment, case: kase, reader: reader
    reader.my_cases << kase

    group = create :group, name: 'A Group'
    create :group_membership, group: group, reader: reader
    create :deployment, group: group, case: kase

    my_group = create :group, name: 'My Group'
    create :group_membership, :admin, group: my_group, reader: reader
    create :deployment, group: my_group, case: kase

    sign_in reader
    get "/cases/#{kase.slug}/forums.json"

    expect(response.body).to be_json including(
      including(
        community: including(name: 'My Group'),
        moderateable: true
      ),
      including(
        community: including(name: 'A Group'),
        moderateable: false
      )
    )
  end
end
