# frozen_string_literal: true

require 'rails_helper'

# A site admin carrying out a full erasure request from the admin reader page
# (Tier 2 erasure checklist, step 5).
RSpec.describe 'Erasing an account from the admin' do
  let(:admin) { create :reader, :editor }
  let(:reader) { create :reader, name: 'Jordan Real' }

  before { sign_in admin }

  context 'with a closed account' do
    before { Readers::CloseAccount.call(reader) }

    it 'links to the erasure page from the reader page' do
      get admin_reader_path(reader)

      expect(response.body).to include erasure_admin_reader_path(reader)
    end

    it 'says what will go before asking for the reader id' do
      create :comment, reader: reader
      create :comment, reader: reader

      get erasure_admin_reader_path(reader)

      expect(response).to have_http_status :ok
      expect(response.body).to include I18n.t('admin.readers.erasure.comments_deleted')
      expect(response.body).to include I18n.t('admin.readers.erasure.confirm', id: reader.id)
      expect(response.body).to include erase_admin_reader_path(reader)
    end

    it 'erases nothing when the reader id is wrong' do
      comment = create :comment, reader: reader

      post erase_admin_reader_path(reader), params: { confirm_reader_id: reader.id + 1 }

      expect(response).to redirect_to erasure_admin_reader_path(reader)
      expect(flash[:alert]).to eq I18n.t('admin.readers.erase.mismatch')
      expect(comment.reload).to be_persisted
      expect(reader.reload).not_to be_anonymized
    end

    it 'erases nothing when the reader id is blank' do
      post erase_admin_reader_path(reader), params: { confirm_reader_id: '' }

      expect(flash[:alert]).to eq I18n.t('admin.readers.erase.mismatch')
      expect(reader.reload).not_to be_anonymized
    end

    it 'erases everything and records who did it' do
      comment = create :comment, reader: reader

      post erase_admin_reader_path(reader), params: { confirm_reader_id: " #{reader.id} " }

      expect(response).to redirect_to admin_reader_path(reader)
      expect(flash[:notice]).to eq I18n.t('admin.readers.erase.erased')
      expect(Comment.exists?(comment.id)).to be false
      expect(reader.reload).to be_anonymized
      expect(reader.account_deletion_requests.sole.erased_by).to eq admin
    end

    # {Readers::EraseAccount} is safe to run again, and checklist step 7 does
    # run it again after a backup is restored: the restored request carries
    # the old erased_at, so the page has to keep offering a way back in or
    # the operator is left typing the URL.
    it 'shows the account as erased afterwards, and still offers a re-run' do
      post erase_admin_reader_path(reader), params: { confirm_reader_id: reader.id }

      get admin_reader_path(reader)

      date = I18n.l(reader.account_deletion_requests.sole.erased_at.to_date, format: :long)
      expect(response.body).to include I18n.t('admin.readers.show.erased', date: date)
      expect(response.body).to include I18n.t('admin.readers.show.erase_again')
      expect(response.body).to include erasure_admin_reader_path(reader)
    end

    it 'keeps showing what was erased, for the reply to the person' do
      create_list :comment, 3, reader: reader
      post erase_admin_reader_path(reader), params: { confirm_reader_id: reader.id }

      get admin_reader_path(reader)

      expect(response.body).to include I18n.t('admin.readers.show.erasure_counts')
      expect(response.body).to match(
        %r{#{Regexp.escape(I18n.t('admin.readers.erasure.comments_deleted'))}</td>\s*<td>3</td>}
      )
    end

    it 'is for site admins only' do
      sign_in create(:reader)

      post erase_admin_reader_path(reader), params: { confirm_reader_id: reader.id }

      expect(reader.reload).not_to be_anonymized
    end
  end

  context 'with an open account' do
    it 'offers no erase link' do
      get admin_reader_path(reader)

      expect(response.body).not_to include erasure_admin_reader_path(reader)
    end

    it 'sends the admin back from the erasure page' do
      get erasure_admin_reader_path(reader)

      expect(response).to redirect_to admin_reader_path(reader)
      expect(flash[:alert]).to eq I18n.t('admin.readers.erase.not_closed')
    end

    it 'refuses to erase, even with the right reader id' do
      comment = create :comment, reader: reader

      post erase_admin_reader_path(reader), params: { confirm_reader_id: reader.id }

      expect(flash[:alert]).to eq I18n.t('admin.readers.erase.not_closed')
      expect(comment.reload).to be_persisted
    end
  end
end
