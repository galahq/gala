locale_regex = /#{Rails.application.config.i18n.available_locales.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  scope "(:locale)", locale: locale_regex do
    resources :enrollments
    resources :groups
    resources :comment_threads
    resources :comments
    resources :cases, param: :slug do
      resources :activities, param: :position
      resources :podcasts, param: :position
      resources :edgenotes, shallow: true, param: :slug
    end
    devise_for :readers, skip: :omniauth_callbacks, controllers: {
      registrations: 'readers/registrations'
    }
  end
  devise_for :readers, only: :omniauth_callbacks, controllers: {
    omniauth_callbacks: 'readers/omniauth_callbacks',
  }
  root to: "cases#index"
end
