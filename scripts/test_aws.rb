  Rails.configuration.active_storage.service = :amazon
  ActiveStorage::Blob.service = :amazon
  configs = Rails.configuration.active_storage.service_configurations
  from_service = ActiveStorage::Service.configure :amazon, configs

  ActiveStorage::Blob.service = from_service

  puts "#{ActiveStorage::Blob.count} Blobs on AWS S3"
