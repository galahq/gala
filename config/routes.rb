locale_regex = /#{Rails.application.config.i18n.available_locales.map(&:to_s).join("|")}/

Rails.application.routes.draw do
  get 'catalog/home'

  get '/read/1071/(*x)', to: redirect('/fr/cases/mi-wolves')
  get '/read/862/(*x)', to: redirect('/cases/indonesia-conservation')
  get '/read/611/(*x)', to: redirect('/cases/ethiopia-napa')
  get '/read/497/(*x)', to: redirect('/cases/mi-wolves')

  scope "(:locale)", locale: locale_regex do
    resources :comment_threads
    resources :comments
    resources :cases, except: %i(index create edit), param: :slug do
      resources :activities, shallow: true
      resources :podcasts, shallow: true
      resources :pages, only: %i(create)
      resources :edgenotes, shallow: true, param: :slug
    end
    resources :pages, only: %i(update destroy) do
      resources :cards, only: %i(create)
    end
    resources :cards, only: %i(update destroy) do
      resources :comment_threads, only: %i(create)
    end

    devise_for :readers, skip: :omniauth_callbacks, controllers: {
      sessions: 'readers/sessions',
      registrations: 'readers/registrations'
    }

    resources :readers, only: %i(show edit update)

    scope 'admin' do

      resources :readers, except: %i(show edit update) do
        resources :roles, only: %i(create destroy)
        collection do
          resources :enrollments, only: %i(index)
        end
      end

      resources :cases, only: %i(index create edit), param: :slug do
        resources :readers, only: %i(destroy) do
          resources :enrollments, only: [] do
            collection do
              put :upsert
            end
          end
        end
      end

      resources :groups
      resources :enrollments, only: [:destroy]

    end
  end

  devise_for :readers, only: :omniauth_callbacks, controllers: {
    omniauth_callbacks: 'readers/omniauth_callbacks',
  }
  root to: "catalog#home"
end
