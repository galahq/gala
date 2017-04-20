class Quiz < ApplicationRecord
  has_many :deployments, dependent: :nullify
  has_many :questions, dependent: :destroy
  belongs_to :case
  belongs_to :template, class_name: "Quiz"
end
