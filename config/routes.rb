# frozen_string_literal: true

LOCALES ||= Rails.application.config.i18n.available_locales
LOCALE_REGEX ||= /#{LOCALES.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  concern :has_statistics do
    resource :statistics, only: %i[show]
  end

  # Some of these links are in published literature and should not be broken
  get '/read/1071/(*x)', to: redirect('/fr/cases/mi-wolves')
  get '/read/862/(*x)', to: redirect('/cases/indonesia-conservation')
  get '/read/611/(*x)', to: redirect('/cases/ethiopia-napa')
  get '/read/497/(*x)', to: redirect('/cases/mi-wolves')

  get '(:locale)', locale: LOCALE_REGEX, to: 'catalog#home'
  root to: 'catalog#home'

  scope '(:locale)', locale: LOCALE_REGEX do
    resources :activities, only: %i[update destroy]

    resources :cards, only: %i[update destroy], concerns: :has_statistics do
      resources :comment_threads, only: %i[create]
    end

    resources :case_elements, only: %i[update]

    resources :cases, only: %i[index show create edit update destroy],
                      param: :slug do
      resources :activities, only: %i[create]

      resources :comment_threads, only: %i[index create]

      resources :communities, only: %i[index]

      resources :edgenotes, only: %i[create]

      resources :editorships, only: %i[new create]

      resource :enrollment, only: %i[create destroy]

      resources :locks, only: %i[index]

      resources :podcasts, only: %i[create]

      resources :pages, only: %i[create]

      resource :settings, module: 'cases', only: %i[edit update]

      collection do
        resources :features, module: 'cases', param: :case_slug,
                             only: %i[index create update destroy]
      end
    end

    scope 'cases' do
      get ':case_slug/*react_router_location', to: 'cases#show'
    end

    namespace 'catalog' do
      resources :content_items, only: %w[create]

      get '*react_router_location', action: :home
    end

    resources :comment_threads, only: %i[show destroy] do
      resources :comments, only: %i[create]
    end

    resources :comments, only: %i[update destroy]

    resources :deployments, only: %i[index new create edit update] do
      resources :submissions, only: %i[index]
    end

    resources :edgenotes, only: %i[update destroy], param: :slug,
                          concerns: :has_statistics do
      resources :attachments, module: 'edgenotes', only: %i[destroy],
                              param: :attribute
      resource :link_expansion, module: 'edgenotes', only: %i[show update]
    end

    resources :editorships, only: %i[destroy]

    resources :enrollments, only: %i[index]

    resources :groups, only: [] do
      resources :canvas_deployments, only: %i[create]
    end

    resources :libraries, param: :slug, only: %i[show]

    resources :locks, only: %i[create destroy]

    resource :magic_link, only: %i[show create]

    resources :my_cases, only: %i[index]

    resources :pages, only: %i[update destroy] do
      resources :cards, only: %i[create]
    end

    resources :podcasts, only: %i[update destroy], concerns: :has_statistics

    resource :profile, controller: :readers, only: %i[show edit update]

    resources :quizzes, only: %i[show] do
      resources :submissions, only: %i[index create]
    end

    resources :readers, only: %i[index] do
      resources :roles, only: %i[create destroy]
    end

    resources :search, only: %i[index]

    devise_for :readers, skip: :omniauth_callbacks, controllers: {
      confirmations: 'readers/confirmations',
      registrations: 'readers/registrations',
      sessions: 'readers/sessions'
    }
  end

  namespace 'authentication_strategies' do
    namespace 'config' do
      get :lti
    end
  end

  devise_for(
    :authentication_strategies,
    only: :omniauth_callbacks,
    controllers: {
      omniauth_callbacks: 'authentication_strategies/omniauth_callbacks'
    }
  )
end
