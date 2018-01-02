# frozen_string_literal: true

locale_regex = /#{Rails.application.config.i18n.available_locales.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  get '/read/1071/(*x)', to: redirect('/fr/cases/mi-wolves')
  get '/read/862/(*x)', to: redirect('/cases/indonesia-conservation')
  get '/read/611/(*x)', to: redirect('/cases/ethiopia-napa')
  get '/read/497/(*x)', to: redirect('/cases/mi-wolves')

  scope '(:locale)', locale: locale_regex do
    resources :comment_threads, only: %i[show destroy] do
      resources :comments, shallow: true, only: %i[create update destroy]
    end
    resources :cases, only: %i[index show new create update], param: :slug do
      resources :case_elements, shallow: true, only: %i[update]
      resources :activities, shallow: true
      resources :podcasts, shallow: true do
        resource :statistics, only: %i[show]
      end
      resources :pages, only: %i[create]
      resources :edgenotes, shallow: true, param: :slug do
        resource :statistics, only: %i[show]
      end
      resources :comment_threads, only: %i[index]
      resources :communities, only: %i[index]

      resource :enrollment, only: %i[destroy]

      get '*react_router_location', to: 'cases#show'

      collection do
        resources :features, only: %i[index create update destroy]
      end
    end
    resources :pages, only: %i[update destroy] do
      resources :cards, only: %i[create]
    end
    resources :cards, only: %i[update destroy] do
      resources :comment_threads, only: %i[create]
      resource :statistics, only: %i[show]
    end

    devise_for :readers, skip: :omniauth_callbacks, controllers: {
      sessions: 'readers/sessions',
      registrations: 'readers/registrations',
      confirmations: 'readers/confirmations'
    }

    resource :profile, controller: :readers, only: %i[show edit update]

    resources :quizzes, only: %i[create update show] do
      resources :submissions, only: %i[index create]
    end

    resources :groups, only: [] do
      resources :deployments, shallow: true, only: %i[create edit update] do
        resources :submissions, only: %i[index]
      end
    end

    resources :enrollments, only: %i[index new create]

    scope 'admin' do
      resources :readers, except: %i[show edit update] do
        resources :roles, only: %i[create destroy]
      end

      resources :groups
      resources :enrollments, only: %i[destroy]
    end

    resources :search, only: %i[index]
    resources :libraries, param: :slug, only: %i[show]

    namespace 'catalog' do
      get :home
      match :content_items, via: %i[get post]
      get '*react_router_location', action: :home
    end
  end

  namespace 'authentication_strategies' do
    namespace 'config' do
      get :lti
    end
  end

  devise_for :authentication_strategies, only: :omniauth_callbacks, controllers: {
    omniauth_callbacks: 'authentication_strategies/omniauth_callbacks'
  }
  get '(:locale)', locale: locale_regex, to: 'catalog#home'
  root to: 'catalog#home'
end
