# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Edgenotes::AttachmentsController do
  let(:kase) { create :case_with_edgenotes, library: nil }
  let(:reader) { kase.editors.create attributes_for :reader }
  let(:edgenote) { kase.edgenotes.first }

  before do
    data = {
      io: StringIO.new(Base64.decode64(
                         ImageDecorator::BLUE_PIXEL.split(',')[1]
                       )),
      filename: 'image.png',
      content_type: 'image/png'
    }

    edgenote.image.attach(data)

    sign_in reader
  end

  describe 'DELETE #destroy' do
    it 'detaches an attached image' do
      delete :destroy, params: { edgenote_slug: edgenote.slug,
                                 attribute: 'image' }
      edgenote.reload
      expect(edgenote.image.attached?).to be_falsey
    end

    it 'authorizes user on her ability to update the edgenote’s case' do
      reader.editorships.find_by(case: kase).destroy
      delete :destroy, params: { edgenote_slug: edgenote.slug,
                                 attribute: 'image' }
      expect(response.status).to eq 302
    end

    it 'returns 404 if the edgenote can’t be found' do
      delete :destroy, params: { edgenote_slug: 'imaginary-edgenote',
                                 attribute: 'private_file' }
      expect(response.status).to eq 404
    end

    it 'limits users to an allowlist of attribute names' do
      delete :destroy, params: { edgenote_slug: edgenote.slug,
                                 attribute: 'private_file' }
      expect(response.status).to eq 404
    end
  end
end
