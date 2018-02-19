# frozen_string_literal: true

# @see Community
class CommunitiesController < ApplicationController
  before_action :authenticate_reader!

  # @route [GET] `/cases/case-slug/communities`
  def index
    kase = Case.friendly.find params[:case_slug]
    @communities = [GlobalCommunity.instance] +
                   Community.active_for_case(kase.id)
                            .merge(current_reader.communities)
  end
end
