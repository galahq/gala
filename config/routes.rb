Rails.application.routes.draw do
  resources :enrollments
  resources :groups
  resources :comment_threads
  resources :comments
  resources :activities
  resources :podcasts
  resources :edgenotes
  devise_for :readers, defaults: { format: :json  },
    controllers: {omniauth_callbacks: 'readers/omniauth_callbacks'}
  resources :cases, param: :slug
  root to: "cases#index"
end
