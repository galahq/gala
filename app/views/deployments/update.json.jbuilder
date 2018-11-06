json.key_format! camelize: :lower

if selection_params
  json.return_url selection_params[:return_url]
  json.return_data selection_params[:return_data]
  json.item_url authentication_strategy_lti_omniauth_callback_url case_slug: @deployment.case.slug
end
