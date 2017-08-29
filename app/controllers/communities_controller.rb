# frozen_string_literal: true

class CommunitiesController < ApplicationController
  before_action :authenticate_reader!

  def index
    kase = Case.find_by_slug params[:case_slug]
    @communities = [GlobalCommunity.instance] +
                   Community.active_for_case(kase.id)
                            .merge(current_reader.communities)
  end
end
