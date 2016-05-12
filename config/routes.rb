Rails.application.routes.draw do
  devise_for :readers, defaults: { format: :json  },
    controllers: {omniauth_callbacks: 'readers/omniauth_callbacks'}
  resources :cases, param: :slug
  root to: "cases#index"
end
