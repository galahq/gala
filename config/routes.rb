# frozen_string_literal: true

require 'sidekiq/web'

LOCALES ||= Rails.application.config.i18n.available_locales
LOCALE_REGEX ||= /#{LOCALES.map(&:to_s).join("|")}/.freeze

# Give React Router any suffix that doesn’t specify a format (with a .json, etc)
REACT_ROUTER_LOCATION_REGEX ||= /[^.]+/.freeze

Rails.application.routes.draw do
  concern :has_statistics do
    resource :statistics, only: %i[show]
  end

  get '403' => 'errors#forbidden'
  get '404' => 'errors#not_found'
  get '422' => 'errors#unprocessable_entity'
  get '500' => 'errors#internal_server_error'

  # Some of these links are in published literature and should not be broken
  get '/read/1071/(*x)', to: redirect('/cases/mi-wolves/translations/fr')
  get '/read/862/(*x)', to: redirect('/cases/indonesia-conservation')
  get '/read/611/(*x)', to: redirect('/cases/ethiopia-napa')
  get '/read/497/(*x)', to: redirect('/cases/mi-wolves')

  get ':locale/*path.:format', locale: LOCALE_REGEX,
                               to: redirect('%{path}.%{format}')
  get ':locale/*path', locale: LOCALE_REGEX, to: redirect('%{path}')

  root to: 'catalog#home'

  resources :activities, only: %i[update destroy]

  namespace :admin do
    namespace :ahoy do
      resources :events
    end

    resources :announcements
    resources :answers
    resources :cases
    resources :comment_threads
    resources :comments
    resources :deployments
    resources :editorships
    resources :enrollments
    resources :forums
    resources :group_memberships
    resources :groups
    resources :questions
    resources :quizzes
    resources :readers
    resources :reading_list_items
    resources :reading_list_saves
    resources :reading_lists
    resources :submissions

    root to: 'cases#index'
  end

  resources :announcements, only: %i[index] do
    resource :dismissal, module: 'announcements', only: %i[create]
  end

  namespace 'authentication_strategies' do
    namespace 'config' do
      get :lti
    end
  end

  resources :cards, only: %i[update destroy], concerns: :has_statistics do
    resources :comment_threads, only: %i[create]
  end

  resources :case_elements, only: %i[update]

  get 'cases/:id/copy', to: "cases#copy", as: 'copy_case'

  resources :cases, only: %i[index show create edit update destroy],
                    param: :slug do
    resources :attachments, module: 'cases', only: %i[destroy],
                            param: :attribute

    resources :activities, only: %i[create]

    resource :archive, only: %i[show]

    resources :comment_threads, only: %i[index create]

    get 'confirm_deletion', to: 'cases/deletions#new'
    post 'confirm_deletion', to: 'cases/deletions#create'

    # get 'copy', to: 'cases#copy'

    resources :edgenotes, only: %i[create]

    resources :editorships, only: %i[new create]

    resource :enrollment, only: %i[create destroy]

    resources :forums, only: %i[index]

    resource :library, module: 'cases', only: %i[update]

    resources :locks, only: %i[index]

    resources :podcasts, only: %i[create]

    resources :pages, only: %i[create]

    resources :quizzes, only: %i[index create]

    resource :settings, module: 'cases', only: %i[edit update]

    resources :taggings, only: %i[create destroy], param: :tag_name

    resources :translations, only: %i[new create show], param: :case_locale

    collection do
      resources :features, module: 'cases', param: :case_slug,
                           only: %i[index create update destroy]
    end
  end

  scope 'cases' do
    get ':case_slug/*react_router_location',
        to: 'cases#show', format: false,
        react_router_location: REACT_ROUTER_LOCATION_REGEX
  end

  namespace 'catalog' do
    resource :content_items, only: %i[create] do
      resource :session, module: 'content_items', only: %i[destroy]
    end

    resources :libraries, only: %i[index]

    get '*react_router_location',
        action: :home, format: false,
        react_router_location: REACT_ROUTER_LOCATION_REGEX
  end

  resources :comment_threads, only: %i[show destroy] do
    resources :comments, only: %i[create]
  end

  resources :comments, only: %i[update destroy]

  resources :deployments, only: %i[index show new create edit update] do
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

  resources :libraries, param: :slug,
                        only: %i[index show create edit update destroy] do
    resources :managerships, only: %i[new create]
  end

  resources :case_library_requests, only: %i[index update destroy]

  resources :locks, only: %i[create destroy]

  resource :magic_link, only: %i[show create]

  resources :managerships, only: %i[index destroy]

  resources :my_cases, only: %i[index]

  resources :pages, only: %i[update destroy] do
    resources :cards, only: %i[create]
  end

  resources :podcasts, only: %i[update destroy], concerns: :has_statistics

  resource :profile, controller: :readers, only: %i[show edit update] do
    resource :persona, only: %i[edit update]
  end

  resources :quizzes, only: %i[show update destroy] do
    resources :submissions, only: %i[index create]
  end

  resources :readers, only: %i[index] do
    member do
      get :edit_tos
      post :update_tos
    end
    resources :roles, only: %i[create destroy]
  end

  resources :reading_lists, only: %i[show new create edit update destroy],
                            param: :uuid do
    resource :save, only: %i[create destroy], controller: :reading_list_saves
  end

  resources :saved_reading_lists, only: %i[index]

  resources :search, only: %i[index]

  resources :spotlight_acknowledgements, only: %i[create]

  resources :tags, only: %i[index]

  devise_for :readers, skip: :omniauth_callbacks, controllers: {
    confirmations: 'readers/confirmations',
    registrations: 'readers/registrations',
    sessions: 'readers/sessions'
  }

  devise_for(
    :authentication_strategies,
    only: :omniauth_callbacks,
    controllers: {
      omniauth_callbacks: 'authentication_strategies/omniauth_callbacks'
    }
  )

  authenticate :reader, ->(reader) { reader.has_role? :editor } do
    mount Sidekiq::Web => '/sidekiq'
  end

  post 'admin/cases/:id/copy', to: "admin/cases#copy", as: 'copy_admin_case'

  get 'health_check', to: 'health_check#index'

end
