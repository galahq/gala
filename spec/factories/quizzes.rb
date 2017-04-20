FactoryGirl.define do
  factory :quiz do
    association :case
    deployments nil
    template nil
    customized false
  end
end
