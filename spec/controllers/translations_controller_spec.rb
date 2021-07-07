# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TranslationsController do
  let(:reader) { create :reader }
  let(:kase) { create :case }

  before do
    sign_in reader
  end

  describe 'POST #create' do
    it 'translates the case' do
      kase.editors << reader
      expect {
      post :create, params: { case_slug: kase.slug, case_locale: 'es' }
      }.to change{ kase.translations.count }.from(0).to(1)
    end
  end
end
