# frozen_string_literal: true

require 'json'
require 'net/http'

puts 'ccc = Case.find_by_slug "mi-wolves"'

edgenote_ids = [502, 513, 516, 539, 552, 556, 563, 566, 569, 572, 576, 580, 582,
                585, 587, 590, 592, 595, 599, 606]

edgenote_ids.each do |edgenote_id|
  uri = URI "http://remley.wcbn.org/ihih-msc/index.php?rest_route=%2Fwp%2Fv2%2Fposts%2F#{edgenote_id}"
  edge = JSON.parse Net::HTTP.get uri

  var_name = "edgenote#{edge['id']}"
  puts 'I18n.locale = :en'
  puts "#{var_name} = ccc.edgenotes.build"
  puts "#{var_name}.caption = '#{edge['title']['rendered']}'"
  puts "#{var_name}.format = :#{edge['format']}"
  puts "#{var_name}.thumbnail_url = '#{edge['better_featured_image']['source_url']}'"
  puts "#{var_name}.content = '#{edge['content']['rendered']}'"
  puts "#{var_name}.slug = 'SLUG'"
  puts "#{var_name}.save"
end
