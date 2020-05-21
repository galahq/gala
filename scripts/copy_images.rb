def migrate(from, to)
  Rails.configuration.active_storage.service = :local
  ActiveStorage::Blob.service = :amazon
  configs = Rails.configuration.active_storage.service_configurations
  from_service = ActiveStorage::Service.configure from, configs
  to_service   = ActiveStorage::Service.configure to, configs

  ActiveStorage::Blob.service = from_service

  puts "#{ActiveStorage::Blob.count} Blobs to go..."
  ActiveStorage::Blob.find_each do |blob|
    print '.'
    begin
      blob.open do |file|
        puts 'opened blob'
        checksum = blob.checksum
        to_service.upload(blob.key, file, checksum: checksum)
      end
    rescue
    end
  end
end


migrate(:amazon, :local)
