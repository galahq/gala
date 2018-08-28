# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LibrariesController do
  let(:reader) { create :reader }
  let(:library) { reader.libraries.create attributes_for :library }

  before do
    sign_in reader
  end

  describe 'PUT #update' do
    it 'does not allow non-editors to set catalog visibility' do
      put :update, params: { slug: library.slug,
                             library: { visible_in_catalog: true } }
      library.reload
      expect(library.visible_in_catalog).to be_falsey
    end
  end
end
