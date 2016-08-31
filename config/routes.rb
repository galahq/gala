locale_regex = /#{Rails.application.config.i18n.available_locales.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  get '/read/1071/(*x)', to: redirect('/fr/cases/mi-wolves')
  get '/read/862/(*x)', to: redirect('/cases/indonesia-conservation')
  get '/read/611/(*x)', to: redirect('/cases/ethiopia-napa')
  get '/read/497/(*x)', to: redirect('/cases/mi-wolves')

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
      sessions: 'readers/sessions',
      registrations: 'readers/registrations'
    }
    resources :readers, only: %i(show edit update)
  end

  scope 'admin' do
    resources :readers, except: %i(show edit update)
    resources :enrollments
  end

  devise_for :readers, only: :omniauth_callbacks, controllers: {
    omniauth_callbacks: 'readers/omniauth_callbacks',
  }
  root to: "cases#index"
end
