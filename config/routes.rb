locale_regex = /#{Rails.application.config.i18n.available_locales.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  devise_for :readers, controllers: {omniauth_callbacks:
                                     'readers/omniauth_callbacks'}
  scope "(:locale)", locale: locale_regex do
    resources :enrollments
    resources :groups
    resources :comment_threads
    resources :comments
    resources :cases, param: :slug do
      resources :activities
      resources :podcasts
      resources :edgenotes, param: :slug
    end
  end
  root to: "cases#index"
end
