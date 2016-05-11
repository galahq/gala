Rails.application.routes.draw do
  resources :cases, param: :slug
end
