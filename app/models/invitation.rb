# frozen_string_literal: true

# An invitation is the secondary way a {Reader} can become a member of a
# {Community}. It’s not built yet, but there will be a workflow for someone
# like a workshop organizer to invite a Reader, and for the Reader to accept
# or decline the invitation.
#
# @attr accepted_at [DateTime]
# @attr rescinded_at [DateTime]
class Invitation < ApplicationRecord
  belongs_to :community
  belongs_to :inviter, class_name: 'Reader'
  belongs_to :reader
end
