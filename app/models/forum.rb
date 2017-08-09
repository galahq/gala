class Forum < ApplicationRecord
  belongs_to :case
  belongs_to :community
end
