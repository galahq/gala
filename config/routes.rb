Rails.application.routes.draw do
  resources :enrollments
  resources :groups
  resources :comment_threads
  resources :comments
  devise_for :readers, controllers: {omniauth_callbacks:
                                     'readers/omniauth_callbacks'}
  resources :cases, param: :slug do
    resources :activities
    resources :podcasts
    resources :edgenotes
  end
  root to: "cases#index"
end
